package com.cims.app.exception;

/**
 * Exception thrown when two-factor authentication is required
 */
public class TwoFactorRequiredException extends RuntimeException {
    
    public TwoFactorRequiredException(String message) {
        super(message);
    }
    
    public TwoFactorRequiredException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Made with Bob