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
    templateId: 'template_password_reset',
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
    new_password: string;
  }) => {
    try {
      const templateParams = {
        to_email: userDetails.to_email,
        to_name: userDetails.to_name,
        subject: emailTemplates.PASSWORD_RESET.subject,
        new_password: userDetails.new_password,
        login_url: `${window.location.origin}/login`,
        system_name: 'Woldia University Teacher Clearance System',
        admin_email: 'admin@woldia.edu',
        message: `
          Your password has been reset by the System Administrator.
          
          Your new password: ${userDetails.new_password}
          
          Please log in using the link above and change your password after your first login.
          
          If you didn't request this change, please contact the System Administrator immediately.
        `,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        emailTemplates.PASSWORD_RESET.templateId,
        templateParams
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

      for (const email of recipients) {
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