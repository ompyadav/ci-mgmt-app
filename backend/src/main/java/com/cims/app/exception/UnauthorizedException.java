package com.cims.app.exception;

/**
 * Exception thrown when user is not authorized to perform an action
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
}

// Made with Bob
