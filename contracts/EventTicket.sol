// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for EventEscrow contract
interface IEventEscrow {
    function getAttendeePayment(uint256 eventId, address attendee) external view returns (uint256);
    function getEscrowDetails(uint256 eventId) external view returns (
        address eventCreator,
        uint256 totalAmount,
        uint256 ticketPrice,
        uint256 ticketCount,
        uint256 eventEndTime,
        bool isCompleted,
        bool isCancelled,
        bool isFundsReleased
    );
}

/**
 * @title EventTicket
 * @dev NFT ticket contract for events - handles both free and paid events
 * @author Festos Team
 */
contract EventTicket is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Structs
    struct TicketMetadata {
        uint256 eventId;
        address eventCreator;
        string eventTitle;
        string eventLocation;
        uint256 eventStartTime;
        uint256 eventEndTime;
        string attendeeName;
        string attendeeEmail;
        uint256 purchaseTime;
        uint256 pricePaid;
        bool isUsed;
        bool isApproved;
    }

    struct Event {
        uint256 eventId;
        address creator;
        string title;
        string location;
        uint256 startTime;
        uint256 endTime;
        uint256 maxCapacity;
        uint256 currentTickets;
        uint256 ticketPrice;
        bool isActive;
        bool requiresEscrow; // New field to indicate if event uses escrow
        string baseURI;
    }

    // State variables
    uint256 private _tokenIds = 0;
    uint256 public nextEventId = 1;
    address public escrowContract;
    
    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => TicketMetadata) public ticketMetadata;
    mapping(uint256 => uint256[]) public eventTickets;
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => mapping(address => bool)) public eventAttendees;
    mapping(uint256 => mapping(address => uint256)) public attendeeTicketIds;

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed creator,
        string title,
        uint256 startTime,
        uint256 ticketPrice
    );

    event TicketMinted(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed attendee,
        string attendeeName,
        uint256 price
    );

    event TicketUsed(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed attendee
    );

    event TicketApproved(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed attendee
    );

    // Modifiers
    modifier eventExists(uint256 _eventId) {
        require(events[_eventId].eventId != 0, "Event does not exist");
        _;
    }

    modifier eventActive(uint256 _eventId) {
        require(events[_eventId].isActive, "Event is not active");
        _;
    }

    modifier onlyEventCreator(uint256 _eventId) {
        require(events[_eventId].creator == msg.sender, "Only event creator can perform this action");
        _;
    }

    modifier eventNotStarted(uint256 _eventId) {
        require(block.timestamp < events[_eventId].startTime, "Event has already started");
        _;
    }

    modifier eventNotEnded(uint256 _eventId) {
        require(block.timestamp < events[_eventId].endTime, "Event has ended");
        _;
    }

    modifier ticketExists(uint256 _tokenId) {
        require(_ownerOf(_tokenId) != address(0), "Ticket does not exist");
        _;
    }

    constructor(address _escrowContract) ERC721("Festos Event Tickets", "FESTOS") Ownable(msg.sender) {
        escrowContract = _escrowContract;
    }

    /**
     * @dev Create a new event
     * @param _title Event title
     * @param _location Event location
     * @param _startTime Event start time (Unix timestamp)
     * @param _endTime Event end time (Unix timestamp)
     * @param _maxCapacity Maximum number of tickets (0 for unlimited)
     * @param _ticketPrice Ticket price in wei (0 for free)
     * @param _requiresEscrow Whether this event requires escrow for payments
     * @param _baseURI Base URI for ticket metadata
     */
    function createEvent(
        string memory _title,
        string memory _location,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxCapacity,
        uint256 _ticketPrice,
        bool _requiresEscrow,
        string memory _baseURI
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_maxCapacity == 0 || _maxCapacity > 0, "Invalid capacity");

        uint256 eventId = nextEventId++;
        
        events[eventId] = Event({
            eventId: eventId,
            creator: msg.sender,
            title: _title,
            location: _location,
            startTime: _startTime,
            endTime: _endTime,
            maxCapacity: _maxCapacity,
            currentTickets: 0,
            ticketPrice: _ticketPrice,
            isActive: true,
            requiresEscrow: _requiresEscrow,
            baseURI: _baseURI
        });

        emit EventCreated(eventId, msg.sender, _title, _startTime, _ticketPrice);
        
        return eventId;
    }

    /**
     * @dev Purchase and mint a ticket for an event
     * @param _eventId Event ID to purchase ticket for
     * @param _attendeeName Name of the attendee
     * @param _attendeeEmail Email of the attendee
     */
    function purchaseTicket(
        uint256 _eventId,
        string memory _attendeeName,
        string memory _attendeeEmail
    ) external payable eventExists(_eventId) eventActive(_eventId) eventNotEnded(_eventId) nonReentrant {
        Event storage eventData = events[_eventId];
        
        require(!eventAttendees[_eventId][msg.sender], "Already have a ticket for this event");
        require(eventData.maxCapacity == 0 || eventData.currentTickets < eventData.maxCapacity, "Event is at full capacity");
        require(bytes(_attendeeName).length > 0, "Attendee name cannot be empty");

        // Handle payment logic based on event type
        if (eventData.requiresEscrow && eventData.ticketPrice > 0) {
            // For paid events with escrow, verify payment was made to escrow contract
            require(msg.value == 0, "Payment should be made to escrow contract first");
            
            // Verify payment exists in escrow contract
            if (escrowContract != address(0)) {
                uint256 escrowPayment = IEventEscrow(escrowContract).getAttendeePayment(_eventId, msg.sender);
                require(escrowPayment >= eventData.ticketPrice, "Payment not found in escrow contract");
            }
        } else {
            // For free events or direct payment events
            require(msg.value == eventData.ticketPrice, "Incorrect ticket price");
        }

        // Mint the NFT ticket
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        // Create ticket metadata
        ticketMetadata[newTokenId] = TicketMetadata({
            eventId: _eventId,
            eventCreator: eventData.creator,
            eventTitle: eventData.title,
            eventLocation: eventData.location,
            eventStartTime: eventData.startTime,
            eventEndTime: eventData.endTime,
            attendeeName: _attendeeName,
            attendeeEmail: _attendeeEmail,
            purchaseTime: block.timestamp,
            pricePaid: eventData.ticketPrice,
            isUsed: false,
            isApproved: true // Auto-approve for now
        });

        // Mint the NFT to the buyer
        _safeMint(msg.sender, newTokenId);

        // Update mappings
        eventTickets[_eventId].push(newTokenId);
        userTickets[msg.sender].push(newTokenId);
        eventAttendees[_eventId][msg.sender] = true;
        attendeeTicketIds[_eventId][msg.sender] = newTokenId;
        
        // Update event stats
        eventData.currentTickets++;

        // For non-escrow events, transfer payment directly to event creator
        if (!eventData.requiresEscrow && msg.value > 0) {
            payable(eventData.creator).transfer(msg.value);
        }

        emit TicketMinted(newTokenId, _eventId, msg.sender, _attendeeName, eventData.ticketPrice);
    }

    /**
     * @dev Use a ticket (mark as attended) - only event creator can call
     * @param _tokenId Ticket token ID to use
     */
    function useTicket(uint256 _tokenId) external ticketExists(_tokenId) {
        TicketMetadata storage ticket = ticketMetadata[_tokenId];
        require(ticket.eventCreator == msg.sender, "Only event creator can use tickets");
        require(!ticket.isUsed, "Ticket already used");
        require(ticket.isApproved, "Ticket not approved");

        ticket.isUsed = true;

        emit TicketUsed(_tokenId, ticket.eventId, ownerOf(_tokenId));
    }

    /**
     * @dev Approve a ticket (for events requiring approval)
     * @param _tokenId Ticket token ID to approve
     */
    function approveTicket(uint256 _tokenId) external ticketExists(_tokenId) {
        TicketMetadata storage ticket = ticketMetadata[_tokenId];
        require(ticket.eventCreator == msg.sender, "Only event creator can approve tickets");
        require(!ticket.isApproved, "Ticket already approved");
        require(!ticket.isUsed, "Ticket already used");

        ticket.isApproved = true;

        emit TicketApproved(_tokenId, ticket.eventId, ownerOf(_tokenId));
    }

    /**
     * @dev Update escrow contract address (owner only)
     * @param _escrowContract New escrow contract address
     */
    function updateEscrowContract(address _escrowContract) external onlyOwner {
        escrowContract = _escrowContract;
    }

    /**
     * @dev Get ticket metadata
     * @param _tokenId Ticket token ID
     * @return Ticket metadata
     */
    function getTicketMetadata(uint256 _tokenId) external view ticketExists(_tokenId) returns (TicketMetadata memory) {
        return ticketMetadata[_tokenId];
    }

    /**
     * @dev Get event details
     * @param _eventId Event ID
     * @return Event details
     */
    function getEvent(uint256 _eventId) external view eventExists(_eventId) returns (Event memory) {
        return events[_eventId];
    }

    /**
     * @dev Get all tickets for an event
     * @param _eventId Event ID
     * @return Array of ticket token IDs
     */
    function getEventTickets(uint256 _eventId) external view eventExists(_eventId) returns (uint256[] memory) {
        return eventTickets[_eventId];
    }

    /**
     * @dev Get all tickets owned by a user
     * @param _user User address
     * @return Array of ticket token IDs
     */
    function getUserTickets(address _user) external view returns (uint256[] memory) {
        return userTickets[_user];
    }

    /**
     * @dev Check if user has ticket for event
     * @param _eventId Event ID
     * @param _user User address
     * @return True if user has ticket
     */
    function hasTicket(uint256 _eventId, address _user) external view eventExists(_eventId) returns (bool) {
        return eventAttendees[_eventId][_user];
    }

    /**
     * @dev Get user's ticket ID for event
     * @param _eventId Event ID
     * @param _user User address
     * @return Ticket token ID (0 if no ticket)
     */
    function getUserTicketId(uint256 _eventId, address _user) external view eventExists(_eventId) returns (uint256) {
        return attendeeTicketIds[_eventId][_user];
    }

    /**
     * @dev Cancel an event (only event creator)
     * @param _eventId Event ID to cancel
     */
    function cancelEvent(uint256 _eventId) external eventExists(_eventId) onlyEventCreator(_eventId) eventNotStarted(_eventId) {
        events[_eventId].isActive = false;
    }

    /**
     * @dev Update event base URI (only event creator)
     * @param _eventId Event ID
     * @param _baseURI New base URI
     */
    function updateEventBaseURI(uint256 _eventId, string memory _baseURI) external eventExists(_eventId) onlyEventCreator(_eventId) {
        events[_eventId].baseURI = _baseURI;
    }

    // Override required functions
    function tokenURI(uint256 _tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        
        TicketMetadata storage ticket = ticketMetadata[_tokenId];
        Event storage eventData = events[ticket.eventId];
        
        // If event has a base URI, use it, otherwise return empty
        if (bytes(eventData.baseURI).length > 0) {
            return string(abi.encodePacked(eventData.baseURI, _tokenId.toString()));
        }
        
        return "";
    }

    function supportsInterface(bytes4 _interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(_interfaceId);
    }
}