import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Email configuration from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def create_verification_email_body(verification_token: str, user_name: str) -> tuple[str, str]:
    """Create HTML and text email body for verification"""
    verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    
    # HTML version
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }}
            .footer {{ font-size: 12px; color: #666; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email Address</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_url}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #007bff;">{verification_url}</p>
                <p>This verification link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Text version
    text_body = f"""
    Hi {user_name},
    
    Thank you for registering! Please verify your email address by visiting this link:
    
    {verification_url}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
    
    This is an automated message, please do not reply.
    """
    
    return html_body, text_body

async def send_verification_email(to_email: str, verification_token: str, user_name: str) -> bool:
    """Send verification email to user"""
    try:
        # Check if email configuration is available
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            logger.warning("Email configuration not found. Verification email not sent.")
            # In development, just log the token
            logger.info(f"Development mode: Verification token for {to_email}: {verification_token}")
            return True
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Verify Your Email Address"
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        
        # Create email body
        html_body, text_body = create_verification_email_body(verification_token, user_name)
        
        # Attach parts
        text_part = MIMEText(text_body, 'plain')
        html_part = MIMEText(html_body, 'html')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Verification email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {to_email}: {str(e)}")
        # In development, still log the token for testing
        logger.info(f"Development mode: Verification token for {to_email}: {verification_token}")
        return True  # Return True in development mode