// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventEscrow
 * @dev Escrow contract for event ticket payments - holds funds until event completion
 * @author Festos Team
 */
contract EventEscrow is ReentrancyGuard, Ownable {
    
    // Structs
    struct EscrowData {
        uint256 eventId;
        address eventCreator;
        uint256 totalAmount;
        uint256 ticketPrice;
        uint256 ticketCount;
        uint256 eventEndTime;
        bool isCompleted;
        bool isCancelled;
        bool isFundsReleased;
        mapping(address => uint256) attendeePayments;
        address[] attendees;
    }
    
    struct EscrowStats {
        uint256 totalEvents;
        uint256 totalAmountLocked;
        uint256 totalCompletedEvents;
        uint256 totalReleasedAmount;
    }
    
    // Events
    event EscrowCreated(
        uint256 indexed eventId,
        address indexed eventCreator,
        uint256 ticketPrice,
        uint256 eventEndTime
    );
    
    event PaymentReceived(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 amount
    );
    
    event EventCompleted(
        uint256 indexed eventId,
        address indexed eventCreator,
        uint256 totalAmount
    );
    
    event EventCancelled(
        uint256 indexed eventId,
        address indexed eventCreator,
        uint256 refundAmount
    );
    
    event FundsReleased(
        uint256 indexed eventId,
        address indexed eventCreator,
        uint256 amount
    );
    
    event RefundIssued(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 amount
    );
    
    // State variables
    uint256 public platformFee = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_EVENT_DURATION = 1 hours;
    uint256 public constant MAX_EVENT_DURATION = 365 days;
    
    mapping(uint256 => EscrowData) public eventEscrows;
    mapping(address => uint256[]) public creatorEvents;
    mapping(address => uint256[]) public attendeeEvents;
    
    EscrowStats public stats;
    
    // Modifiers
    modifier eventExists(uint256 _eventId) {
        require(eventEscrows[_eventId].eventCreator != address(0), "Event does not exist");
        _;
    }
    
    modifier onlyEventCreator(uint256 _eventId) {
        require(eventEscrows[_eventId].eventCreator == msg.sender, "Only event creator can perform this action");
        _;
    }
    
    modifier eventNotCompleted(uint256 _eventId) {
        require(!eventEscrows[_eventId].isCompleted, "Event already completed");
        _;
    }
    
    modifier eventNotCancelled(uint256 _eventId) {
        require(!eventEscrows[_eventId].isCancelled, "Event is cancelled");
        _;
    }
    
    modifier eventEnded(uint256 _eventId) {
        require(block.timestamp >= eventEscrows[_eventId].eventEndTime, "Event has not ended");
        _;
    }
    
    modifier eventNotEnded(uint256 _eventId) {
        require(block.timestamp < eventEscrows[_eventId].eventEndTime, "Event has ended");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create an escrow for an event
     * @param _eventId Event ID
     * @param _ticketPrice Price per ticket in wei
     * @param _eventEndTime Event end time (Unix timestamp)
     */
    function createEventEscrow(
        uint256 _eventId,
        uint256 _ticketPrice,
        uint256 _eventEndTime
    ) external {
        require(_eventId > 0, "Invalid event ID");
        require(_ticketPrice >= 0, "Ticket price cannot be negative");
        require(_eventEndTime > block.timestamp + MIN_EVENT_DURATION, "Event end time too soon");
        require(_eventEndTime <= block.timestamp + MAX_EVENT_DURATION, "Event end time too far");
        require(eventEscrows[_eventId].eventCreator == address(0), "Event escrow already exists");
        
        EscrowData storage escrow = eventEscrows[_eventId];
        escrow.eventId = _eventId;
        escrow.eventCreator = msg.sender;
        escrow.ticketPrice = _ticketPrice;
        escrow.eventEndTime = _eventEndTime;
        escrow.isCompleted = false;
        escrow.isCancelled = false;
        escrow.isFundsReleased = false;
        
        creatorEvents[msg.sender].push(_eventId);
        stats.totalEvents++;
        
        emit EscrowCreated(_eventId, msg.sender, _ticketPrice, _eventEndTime);
    }
    
    /**
     * @dev Purchase a ticket and pay into escrow
     * @param _eventId Event ID
     */
    function purchaseTicket(uint256 _eventId) external payable eventExists(_eventId) eventNotCompleted(_eventId) eventNotCancelled(_eventId) eventNotEnded(_eventId) {
        EscrowData storage escrow = eventEscrows[_eventId];
        
        require(msg.value == escrow.ticketPrice, "Incorrect ticket price");
        require(escrow.attendeePayments[msg.sender] == 0, "Already purchased ticket");
        
        escrow.attendeePayments[msg.sender] = msg.value;
        escrow.attendees.push(msg.sender);
        escrow.totalAmount += msg.value;
        escrow.ticketCount++;
        
        attendeeEvents[msg.sender].push(_eventId);
        stats.totalAmountLocked += msg.value;
        
        emit PaymentReceived(_eventId, msg.sender, msg.value);
    }
    
    /**
     * @dev Mark event as completed (only event creator)
     * @param _eventId Event ID
     */
    function completeEvent(uint256 _eventId) external eventExists(_eventId) onlyEventCreator(_eventId) eventNotCompleted(_eventId) eventNotCancelled(_eventId) eventEnded(_eventId) {
        EscrowData storage escrow = eventEscrows[_eventId];
        
        escrow.isCompleted = true;
        stats.totalCompletedEvents++;
        
        emit EventCompleted(_eventId, msg.sender, escrow.totalAmount);
    }
    
    /**
     * @dev Cancel event and allow refunds (only event creator)
     * @param _eventId Event ID
     */
    function cancelEvent(uint256 _eventId) external eventExists(_eventId) onlyEventCreator(_eventId) eventNotCompleted(_eventId) eventNotCancelled(_eventId) eventNotEnded(_eventId) {
        EscrowData storage escrow = eventEscrows[_eventId];
        
        escrow.isCancelled = true;
        stats.totalAmountLocked -= escrow.totalAmount;
        
        emit EventCancelled(_eventId, msg.sender, escrow.totalAmount);
    }
    
    /**
     * @dev Release funds to event creator after successful completion
     * @param _eventId Event ID
     */
    function releaseFunds(uint256 _eventId) external eventExists(_eventId) onlyEventCreator(_eventId) eventEnded(_eventId) nonReentrant {
        EscrowData storage escrow = eventEscrows[_eventId];
        
        require(!escrow.isFundsReleased, "Funds already released");
        require(escrow.isCompleted, "Event must be completed first");
        
        escrow.isFundsReleased = true;
        
        // Calculate platform fee
        uint256 platformFeeAmount = (escrow.totalAmount * platformFee) / BASIS_POINTS;
        uint256 creatorAmount = escrow.totalAmount - platformFeeAmount;
        
        // Transfer platform fee to owner
        if (platformFeeAmount > 0) {
            payable(owner()).transfer(platformFeeAmount);
        }
        
        // Transfer remaining amount to event creator
        if (creatorAmount > 0) {
            payable(escrow.eventCreator).transfer(creatorAmount);
        }
        
        stats.totalAmountLocked -= escrow.totalAmount;
        stats.totalReleasedAmount += creatorAmount;
        
        emit FundsReleased(_eventId, escrow.eventCreator, creatorAmount);
    }
    
    /**
     * @dev Refund attendee for cancelled event
     * @param _eventId Event ID
     */
    function refundAttendee(uint256 _eventId) external eventExists(_eventId) eventNotCompleted(_eventId) nonReentrant {
        EscrowData storage escrow = eventEscrows[_eventId];
        require(escrow.isCancelled, "Event must be cancelled for refunds");
        
        require(escrow.attendeePayments[msg.sender] > 0, "No payment to refund");
        
        uint256 refundAmount = escrow.attendeePayments[msg.sender];
        escrow.attendeePayments[msg.sender] = 0;
        
        stats.totalAmountLocked -= refundAmount;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit RefundIssued(_eventId, msg.sender, refundAmount);
    }
    
    /**
     * @dev Get escrow details
     * @param _eventId Event ID
     * @return eventCreator Creator address
     * @return totalAmount Total amount locked
     * @return ticketPrice Ticket price
     * @return ticketCount Number of tickets sold
     * @return eventEndTime Event end time
     * @return isCompleted Whether event is completed
     * @return isCancelled Whether event is cancelled
     * @return isFundsReleased Whether funds are released
     */
    function getEscrowDetails(uint256 _eventId) external view eventExists(_eventId) returns (
        address eventCreator,
        uint256 totalAmount,
        uint256 ticketPrice,
        uint256 ticketCount,
        uint256 eventEndTime,
        bool isCompleted,
        bool isCancelled,
        bool isFundsReleased
    ) {
        EscrowData storage escrow = eventEscrows[_eventId];
        return (
            escrow.eventCreator,
            escrow.totalAmount,
            escrow.ticketPrice,
            escrow.ticketCount,
            escrow.eventEndTime,
            escrow.isCompleted,
            escrow.isCancelled,
            escrow.isFundsReleased
        );
    }
    
    /**
     * @dev Get attendee payment amount
     * @param _eventId Event ID
     * @param _attendee Attendee address
     * @return Payment amount
     */
    function getAttendeePayment(uint256 _eventId, address _attendee) external view eventExists(_eventId) returns (uint256) {
        return eventEscrows[_eventId].attendeePayments[_attendee];
    }
    
    /**
     * @dev Get all attendees for an event
     * @param _eventId Event ID
     * @return Array of attendee addresses
     */
    function getEventAttendees(uint256 _eventId) external view eventExists(_eventId) returns (address[] memory) {
        return eventEscrows[_eventId].attendees;
    }
    
    /**
     * @dev Get events created by a creator
     * @param _creator Creator address
     * @return Array of event IDs
     */
    function getCreatorEvents(address _creator) external view returns (uint256[] memory) {
        return creatorEvents[_creator];
    }
    
    /**
     * @dev Get events attended by an address
     * @param _attendee Attendee address
     * @return Array of event IDs
     */
    function getAttendeeEvents(address _attendee) external view returns (uint256[] memory) {
        return attendeeEvents[_attendee];
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
     * @dev Get contract statistics
     * @return totalEvents Total number of events
     * @return totalAmountLocked Total amount locked in escrow
     * @return totalCompletedEvents Total completed events
     * @return totalReleasedAmount Total amount released
     */
    function getStats() external view returns (
        uint256 totalEvents,
        uint256 totalAmountLocked,
        uint256 totalCompletedEvents,
        uint256 totalReleasedAmount
    ) {
        return (
            stats.totalEvents,
            stats.totalAmountLocked,
            stats.totalCompletedEvents,
            stats.totalReleasedAmount
        );
    }
    
    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
