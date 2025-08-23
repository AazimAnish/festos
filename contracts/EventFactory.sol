// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EventFactory
 * @dev A smart contract for creating and managing events on the blockchain
 * @author Festos Team
 */
contract EventFactory is ReentrancyGuard, Ownable {
    using Strings for uint256;

    constructor() Ownable(msg.sender) {}

    // Structs
    struct Event {
        uint256 eventId;
        address creator;
        string title;
        string description;
        string location;
        uint256 startTime;
        uint256 endTime;
        uint256 maxCapacity;
        uint256 currentAttendees;
        uint256 ticketPrice;
        bool isActive;
        bool requireApproval;
        bool hasPOAP;
        string poapMetadata;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Ticket {
        uint256 ticketId;
        uint256 eventId;
        address attendee;
        uint256 purchaseTime;
        bool isUsed;
        bool isApproved;
        uint256 pricePaid;
    }

    struct EventStats {
        uint256 totalRevenue;
        uint256 totalTicketsSold;
        uint256 totalAttendees;
    }

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed creator,
        string title,
        uint256 startTime,
        uint256 ticketPrice
    );

    event EventUpdated(
        uint256 indexed eventId,
        address indexed creator,
        string title
    );

    event EventCancelled(uint256 indexed eventId, address indexed creator);

    event TicketPurchased(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed attendee,
        uint256 price
    );

    event TicketApproved(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed attendee
    );

    event TicketUsed(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed attendee
    );

    event POAPMinted(
        uint256 indexed eventId,
        address indexed attendee,
        string poapMetadata
    );

    // State variables
    uint256 public nextEventId = 1;
    uint256 public nextTicketId = 1;
    uint256 public platformFee = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => EventStats) public eventStats;
    mapping(address => uint256[]) public userEvents;
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => mapping(address => bool)) public eventAttendees;
    mapping(uint256 => mapping(address => uint256)) public attendeeTicketIds;

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

    /**
     * @dev Create a new event
     * @param _title Event title
     * @param _description Event description
     * @param _location Event location
     * @param _startTime Event start time (Unix timestamp)
     * @param _endTime Event end time (Unix timestamp)
     * @param _maxCapacity Maximum number of attendees (0 for unlimited)
     * @param _ticketPrice Ticket price in wei (0 for free)
     * @param _requireApproval Whether approval is required for tickets
     * @param _hasPOAP Whether the event includes POAP
     * @param _poapMetadata POAP metadata URI
     */
    function createEvent(
        string memory _title,
        string memory _description,
        string memory _location,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxCapacity,
        uint256 _ticketPrice,
        bool _requireApproval,
        bool _hasPOAP,
        string memory _poapMetadata
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
            description: _description,
            location: _location,
            startTime: _startTime,
            endTime: _endTime,
            maxCapacity: _maxCapacity,
            currentAttendees: 0,
            ticketPrice: _ticketPrice,
            isActive: true,
            requireApproval: _requireApproval,
            hasPOAP: _hasPOAP,
            poapMetadata: _poapMetadata,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        userEvents[msg.sender].push(eventId);
        eventStats[eventId] = EventStats(0, 0, 0);

        emit EventCreated(eventId, msg.sender, _title, _startTime, _ticketPrice);
        
        return eventId;
    }

    /**
     * @dev Update an existing event
     * @param _eventId Event ID to update
     * @param _title New event title
     * @param _description New event description
     * @param _location New event location
     * @param _startTime New event start time
     * @param _endTime New event end time
     * @param _maxCapacity New maximum capacity
     * @param _ticketPrice New ticket price
     * @param _requireApproval New approval requirement
     */
    function updateEvent(
        uint256 _eventId,
        string memory _title,
        string memory _description,
        string memory _location,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxCapacity,
        uint256 _ticketPrice,
        bool _requireApproval
    ) external eventExists(_eventId) onlyEventCreator(_eventId) eventNotStarted(_eventId) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_maxCapacity == 0 || _maxCapacity >= events[_eventId].currentAttendees, "Capacity cannot be less than current attendees");

        Event storage eventData = events[_eventId];
        eventData.title = _title;
        eventData.description = _description;
        eventData.location = _location;
        eventData.startTime = _startTime;
        eventData.endTime = _endTime;
        eventData.maxCapacity = _maxCapacity;
        eventData.ticketPrice = _ticketPrice;
        eventData.requireApproval = _requireApproval;
        eventData.updatedAt = block.timestamp;

        emit EventUpdated(_eventId, msg.sender, _title);
    }

    /**
     * @dev Cancel an event
     * @param _eventId Event ID to cancel
     */
    function cancelEvent(uint256 _eventId) external eventExists(_eventId) onlyEventCreator(_eventId) eventNotStarted(_eventId) {
        events[_eventId].isActive = false;
        events[_eventId].updatedAt = block.timestamp;

        emit EventCancelled(_eventId, msg.sender);
    }

    /**
     * @dev Purchase a ticket for an event
     * @param _eventId Event ID to purchase ticket for
     */
    function purchaseTicket(uint256 _eventId) external payable eventExists(_eventId) eventActive(_eventId) eventNotEnded(_eventId) nonReentrant {
        Event storage eventData = events[_eventId];
        
        require(!eventAttendees[_eventId][msg.sender], "Already have a ticket for this event");
        require(eventData.maxCapacity == 0 || eventData.currentAttendees < eventData.maxCapacity, "Event is at full capacity");
        require(msg.value == eventData.ticketPrice, "Incorrect ticket price");

        uint256 ticketId = nextTicketId++;
        
        tickets[ticketId] = Ticket({
            ticketId: ticketId,
            eventId: _eventId,
            attendee: msg.sender,
            purchaseTime: block.timestamp,
            isUsed: false,
            isApproved: !eventData.requireApproval,
            pricePaid: msg.value
        });

        eventAttendees[_eventId][msg.sender] = true;
        attendeeTicketIds[_eventId][msg.sender] = ticketId;
        userTickets[msg.sender].push(ticketId);
        
        eventData.currentAttendees++;
        eventStats[_eventId].totalTicketsSold++;
        eventStats[_eventId].totalRevenue += msg.value;

        // Transfer platform fee to owner
        uint256 platformFeeAmount = (msg.value * platformFee) / BASIS_POINTS;
        if (platformFeeAmount > 0) {
            payable(owner()).transfer(platformFeeAmount);
        }

        // Transfer remaining amount to event creator
        uint256 creatorAmount = msg.value - platformFeeAmount;
        if (creatorAmount > 0) {
            payable(eventData.creator).transfer(creatorAmount);
        }

        emit TicketPurchased(ticketId, _eventId, msg.sender, msg.value);
    }

    /**
     * @dev Approve a ticket (for events requiring approval)
     * @param _ticketId Ticket ID to approve
     */
    function approveTicket(uint256 _ticketId) external eventExists(tickets[_ticketId].eventId) onlyEventCreator(tickets[_ticketId].eventId) {
        Ticket storage ticket = tickets[_ticketId];
        require(!ticket.isApproved, "Ticket already approved");
        require(!ticket.isUsed, "Ticket already used");

        ticket.isApproved = true;
        eventStats[ticket.eventId].totalAttendees++;

        emit TicketApproved(_ticketId, ticket.eventId, ticket.attendee);
    }

    /**
     * @dev Use a ticket (mark as attended)
     * @param _ticketId Ticket ID to use
     */
    function useTicket(uint256 _ticketId) external eventExists(tickets[_ticketId].eventId) onlyEventCreator(tickets[_ticketId].eventId) {
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.isApproved, "Ticket not approved");
        require(!ticket.isUsed, "Ticket already used");

        ticket.isUsed = true;

        // Mint POAP if event has POAP enabled
        if (events[ticket.eventId].hasPOAP) {
            emit POAPMinted(ticket.eventId, ticket.attendee, events[ticket.eventId].poapMetadata);
        }

        emit TicketUsed(_ticketId, ticket.eventId, ticket.attendee);
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
     * @dev Get multiple events by IDs
     * @param _eventIds Array of event IDs
     * @return Array of Event structs
     */
    function getEvents(uint256[] calldata _eventIds) external view returns (Event[] memory) {
        Event[] memory result = new Event[](_eventIds.length);
        
        for (uint256 i = 0; i < _eventIds.length; i++) {
            uint256 eventId = _eventIds[i];
            if (events[eventId].eventId != 0) {
                result[i] = events[eventId];
            }
        }
        
        return result;
    }

    /**
     * @dev Get events by creator with pagination
     * @param _creator Creator address
     * @param _offset Starting index
     * @param _limit Maximum number of events to return
     * @return Array of Event structs
     */
    function getEventsByCreator(address _creator, uint256 _offset, uint256 _limit) external view returns (Event[] memory) {
        uint256[] memory userEventIds = userEvents[_creator];
        uint256 totalEvents = userEventIds.length;
        
        if (_offset >= totalEvents) {
            return new Event[](0);
        }
        
        uint256 endIndex = _offset + _limit;
        if (endIndex > totalEvents) {
            endIndex = totalEvents;
        }
        
        uint256 resultLength = endIndex - _offset;
        Event[] memory result = new Event[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            uint256 eventId = userEventIds[_offset + i];
            result[i] = events[eventId];
        }
        
        return result;
    }

    /**
     * @dev Get active events with pagination
     * @param _offset Starting index
     * @param _limit Maximum number of events to return
     * @return Array of Event structs
     */
    function getActiveEvents(uint256 _offset, uint256 _limit) external view returns (Event[] memory) {
        uint256 totalEvents = nextEventId - 1;
        
        if (_offset >= totalEvents) {
            return new Event[](0);
        }
        
        uint256 endIndex = _offset + _limit;
        if (endIndex > totalEvents) {
            endIndex = totalEvents;
        }
        
        // First pass: count active events
        uint256 activeCount = 0;
        for (uint256 i = _offset + 1; i <= endIndex; i++) {
            Event storage eventData = events[i];
            if (eventData.isActive && eventData.startTime > block.timestamp) {
                activeCount++;
            }
        }
        
        // Second pass: populate result array
        Event[] memory result = new Event[](activeCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = _offset + 1; i <= endIndex; i++) {
            Event storage eventData = events[i];
            if (eventData.isActive && eventData.startTime > block.timestamp) {
                result[resultIndex] = eventData;
                resultIndex++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get ticket details
     * @param _ticketId Ticket ID
     * @return Ticket details
     */
    function getTicket(uint256 _ticketId) external view returns (Ticket memory) {
        require(tickets[_ticketId].ticketId != 0, "Ticket does not exist");
        return tickets[_ticketId];
    }

    /**
     * @dev Get event statistics
     * @param _eventId Event ID
     * @return Event statistics
     */
    function getEventStats(uint256 _eventId) external view eventExists(_eventId) returns (EventStats memory) {
        return eventStats[_eventId];
    }

    /**
     * @dev Get user's events
     * @param _user User address
     * @return Array of event IDs
     */
    function getUserEvents(address _user) external view returns (uint256[] memory) {
        return userEvents[_user];
    }

    /**
     * @dev Get user's tickets
     * @param _user User address
     * @return Array of ticket IDs
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
     * @return Ticket ID (0 if no ticket)
     */
    function getUserTicketId(uint256 _eventId, address _user) external view eventExists(_eventId) returns (uint256) {
        return attendeeTicketIds[_eventId][_user];
    }

    /**
     * @dev Update platform fee (owner only)
     * @param _newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Platform fee cannot exceed 10%");
        platformFee = _newFee;
    }

    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawPlatformFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get total number of events
     * @return Total event count
     */
    function getTotalEvents() external view returns (uint256) {
        return nextEventId - 1;
    }

    /**
     * @dev Get total number of tickets
     * @return Total ticket count
     */
    function getTotalTickets() external view returns (uint256) {
        return nextTicketId - 1;
    }
}
