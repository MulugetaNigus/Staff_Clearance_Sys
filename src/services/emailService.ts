import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'osEaX05L_AK2y7bN7',
  SERVICE_ID: 'service_v726top',
  TEMPLATE_ID: 'template_6338hhb',
};

// Email templates for different types of notifications
export const emailTemplates = {
  USER_CREATION: {
    templateId: 'template_user_creation',
    subject: 'Your New Account - Woldia University TCS',
  },
  PASSWORD_RESET: {
    templateId: "template_ki4x62g",
    subject: 'Password Reset - Woldia University TCS',
  },
  ACCOUNT_ACTIVATION: {
    templateId: 'template_account_activation',
    subject: 'Account Activated - Woldia University TCS',
  },
  ACCOUNT_DEACTIVATION: {
    templateId: 'template_account_deactivation',
    subject: 'Account Deactivated - Woldia University TCS',
  },
  SYSTEM_NOTIFICATION: {
    templateId: 'template_system_notification',
    subject: 'System Notification - Woldia University TCS',
  },
};

// Email service functions
export const emailService = {
  // Send user creation email with credentials
  sendUserCreationEmail: async (userDetails: {
    to_email: string;
    to_name: string;
    username: string;
    password: string;
    role: string;
    department: string;
  }) => {
    if (!userDetails.to_email || !isValidEmail(userDetails.to_email)) {
      console.error('Invalid email address:', userDetails.to_email);
      return { success: false, error: 'Invalid email address' };
    }

    try {
      const templateParams = {
        to_name: userDetails.to_name,
        email: userDetails.to_email,
        username: userDetails.username,
        password: userDetails.password,
        role: userDetails.role,
        department: userDetails.department,
        login_url: `${window.location.origin}/login`,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log('User creation email sent successfully:', response);
      return { success: true, response };
    } catch (error: any) {
      console.error('Failed to send user creation email:', error);
      return { success: false, error };
    }
  },

  // Send registration email (alias for sendUserCreationEmail)
  sendRegistrationEmail: async (userDetails: {
    to_email: string;
    to_name: string;
    username: string;
    password: string;
  }) => {
    return emailService.sendUserCreationEmail({
      ...userDetails,
      role: 'User', // Default role if not specified
      department: 'General' // Default department if not specified
    });
  },

  // Send password reset email
  sendPasswordResetEmail: async (userDetails: {
    to_email: string;
    to_name: string;
    reset_link: string;
  }) => {
    if (!userDetails.to_email || !isValidEmail(userDetails.to_email)) {
      console.error('Invalid email address:', userDetails.to_email);
      return { success: false, error: 'Invalid email address' };
    }

    try {
      const templateParams = {
        to_email: userDetails.to_email,
        to_name: userDetails.to_name,
        recipient_email: userDetails.to_email, // Added for redundancy, in case template expects this
        subject: emailTemplates.PASSWORD_RESET.subject,
        reset_link: userDetails.reset_link,
        system_name: 'Woldia University Teacher Clearance System',
        admin_email: 'admin@woldia.edu',
        message: `
          You are receiving this email because you (or someone else) has requested a password reset for your account.
          
          Please click on the following link to reset your password:
          
          ${userDetails.reset_link}
          
          If you did not request this, please ignore this email and your password will remain unchanged.
        `,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        emailTemplates.PASSWORD_RESET.templateId,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log('Password reset email sent successfully:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error };
    }
  },

  // Send account status change email
  sendAccountStatusEmail: async (userDetails: {
    to_email: string;
    to_name: string;
    status: 'activated' | 'deactivated';
    reason?: string;
  }) => {
    if (!userDetails.to_email || !isValidEmail(userDetails.to_email)) {
      console.error('Invalid email address:', userDetails.to_email);
      return { success: false, error: 'Invalid email address' };
    }

    try {
      const isActivated = userDetails.status === 'activated';
      const template = isActivated ? emailTemplates.ACCOUNT_ACTIVATION : emailTemplates.ACCOUNT_DEACTIVATION;

      const templateParams = {
        to_email: userDetails.to_email,
        to_name: userDetails.to_name,
        subject: template.subject,
        status: userDetails.status,
        reason: userDetails.reason || 'No specific reason provided',
        login_url: `${window.location.origin}/login`,
        system_name: 'Woldia University Teacher Clearance System',
        admin_email: 'admin@woldia.edu',
        message: isActivated
          ? `
            Good news! Your account has been activated.
            
            You can now log in and access the Teacher Clearance System.
            
            If you have any questions, please contact the System Administrator.
          `
          : `
            Your account has been deactivated by the System Administrator.
            
            Reason: ${userDetails.reason || 'Administrative decision'}
            
            If you believe this is an error, please contact the System Administrator.
          `,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        template.templateId,
        templateParams
      );

      console.log(`Account ${userDetails.status} email sent successfully:`, response);
      return { success: true, response };
    } catch (error) {
      console.error(`Failed to send account ${userDetails.status} email:`, error);
      return { success: false, error };
    }
  },

  // Send system notification email
  sendSystemNotificationEmail: async (recipients: string[], notification: {
    subject: string;
    message: string;
    priority?: 'low' | 'normal' | 'high';
  }) => {
    try {
      const results = [];
      const validRecipients = recipients.filter(email => isValidEmail(email));

      if (validRecipients.length === 0) {
        console.error('No valid recipients found');
        return { success: false, error: 'No valid recipients found' };
      }

      for (const email of validRecipients) {
        const templateParams = {
          to_email: email,
          subject: notification.subject,
          message: notification.message,
          priority: notification.priority || 'normal',
          system_name: 'Woldia University Teacher Clearance System',
          admin_email: 'admin@woldia.edu',
          timestamp: new Date().toLocaleDateString(),
        };

        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          emailTemplates.SYSTEM_NOTIFICATION.templateId,
          templateParams
        );

        results.push({ email, success: true, response });
      }

      console.log('System notification emails sent successfully:', results);
      return { success: true, results };
    } catch (error) {
      console.error('Failed to send system notification emails:', error);
      return { success: false, error };
    }
  },

  // Test email service
  testEmailService: async (testEmail: string) => {
    if (!testEmail || !isValidEmail(testEmail)) {
      console.error('Invalid email address:', testEmail);
      return { success: false, error: 'Invalid email address' };
    }

    try {
      const templateParams = {
        to_email: testEmail,
        to_name: 'Test User',
        subject: 'EmailJS Test - Woldia University TCS',
        message: 'This is a test email to verify EmailJS integration is working correctly.',
        system_name: 'Woldia University Teacher Clearance System',
        admin_email: 'admin@woldia.edu',
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        'template_test', // Create a simple test template
        templateParams
      );

      console.log('Test email sent successfully:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send test email:', error);
      return { success: false, error };
    }
  },
};

// Utility function to validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};