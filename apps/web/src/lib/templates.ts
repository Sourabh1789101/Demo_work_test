import { nanoid } from 'nanoid';
import { FormSchema, FormComponent } from '../../modules/Core/types';

export interface FormTemplate {
  id: string;
  label: string;
  description: string;
  category: 'business' | 'personal' | 'feedback' | 'registration' | 'ecommerce' | 'education' | 'legal' | 'nonprofit' | 'fitness' | 'restaurant' | 'realestate' | 'travel' | 'creative' | 'pet' | 'medical' | 'survey' | 'multipage';
  icon: string;
  color: string;   // Tailwind gradient classes for card accent
  fields: number;  // count shown on card
  buildSchema: () => Partial<FormSchema>;
}

// ── Helper to build a component quickly ──────────────────────────────────────
function field(
  type: FormComponent['type'],
  label: string,
  props: Record<string, any> = {},
  validation: any[] = [],
): FormComponent {
  return {
    id: nanoid(),
    type,
    label,
    properties: props,
    validation,
    styles: {},
  };
}

function required(message?: string) {
  return [{ id: nanoid(), type: 'required' as const, message: message ?? '' }];
}

// ── Template definitions ──────────────────────────────────────────────────────
export const FORM_TEMPLATES: FormTemplate[] = [

  // ─────────────────────────────────────────────
  // 1. Contact Form
  // ─────────────────────────────────────────────
  {
    id: 'contact',
    label: 'Contact Form',
    description: 'Simple contact form with name, email, subject, and message fields.',
    category: 'business',
    icon: '✉️',
    color: 'from-blue-500 to-blue-600',
    fields: 6,
    buildSchema: () => ({
      title: 'Contact Us',
      description: 'Have a question? We would love to hear from you.',
      components: [
        field('heading', 'Contact Us', { level: 2, content: 'Contact Us' }),
        field('paragraph', 'Intro', { content: "Fill in the form below and we'll get back to you as soon as possible." }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: 'Please enter a valid email' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('select', 'Subject', {
          placeholder: 'Select a subject...',
          options: [
            { id: nanoid(), label: 'General Enquiry', value: 'general' },
            { id: nanoid(), label: 'Technical Support', value: 'support' },
            { id: nanoid(), label: 'Sales', value: 'sales' },
            { id: nanoid(), label: 'Billing', value: 'billing' },
            { id: nanoid(), label: 'Partnership', value: 'partnership' },
          ],
        }, required()),
        field('textarea', 'Message', { placeholder: 'Write your message here...', rows: 5, helperText: '' }, required()),
      ],
      settings: { submitButtonText: 'Send Message', successMessage: 'Thank you! We will be in touch soon.', layout: 'vertical', multiStep: false, theme: 'blue' },
    }),
  },

  // ─────────────────────────────────────────────
  // 2. User Registration
  // ─────────────────────────────────────────────
  {
    id: 'registration',
    label: 'User Registration',
    description: 'Account sign-up form with name, email, password and terms.',
    category: 'registration',
    icon: '👤',
    color: 'from-purple-500 to-purple-600',
    fields: 7,
    buildSchema: () => ({
      title: 'Create Your Account',
      description: 'Join us today. It only takes a minute.',
      components: [
        field('heading', 'Create Account', { level: 2, content: 'Create Your Account' }),
        field('textfield', 'First Name', { placeholder: 'John', helperText: '' }, required()),
        field('textfield', 'Last Name', { placeholder: 'Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: 'Please enter a valid email' },
        ]),
        field('password', 'Password', { placeholder: '••••••••', helperText: 'Minimum 8 characters' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
        ]),
        field('password', 'Confirm Password', { placeholder: '••••••••', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: 'You must be 18+ to register' }),
        field('checkbox', 'Agreements', {
          options: [
            { id: nanoid(), label: 'I agree to the Terms of Service', value: 'terms' },
            { id: nanoid(), label: 'I agree to the Privacy Policy', value: 'privacy' },
          ],
        }, required()),
      ],
      settings: { submitButtonText: 'Create Account', successMessage: 'Welcome! Your account has been created.', layout: 'vertical', multiStep: false, theme: 'purple' },
    }),
  },

  // ─────────────────────────────────────────────
  // 3. Customer Feedback / Survey
  // ─────────────────────────────────────────────
  {
    id: 'feedback',
    label: 'Customer Feedback',
    description: 'Collect satisfaction ratings, comments, and improvement ideas.',
    category: 'feedback',
    icon: '⭐',
    color: 'from-yellow-500 to-orange-500',
    fields: 6,
    buildSchema: () => ({
      title: 'Share Your Feedback',
      description: 'Your opinion helps us improve. Thank you for taking the time!',
      components: [
        field('heading', 'Feedback', { level: 2, content: 'How did we do?' }),
        field('rating', 'Overall Satisfaction', { maxRating: 5, helperText: '' }),
        field('radio', 'Would you recommend us?', {
          options: [
            { id: nanoid(), label: 'Definitely yes', value: 'yes' },
            { id: nanoid(), label: 'Probably yes', value: 'probably' },
            { id: nanoid(), label: 'Not sure', value: 'unsure' },
            { id: nanoid(), label: 'No', value: 'no' },
          ],
        }),
        field('multiselect', 'What did you like most?', {
          options: [
            { id: nanoid(), label: 'Product quality', value: 'quality' },
            { id: nanoid(), label: 'Customer service', value: 'service' },
            { id: nanoid(), label: 'Pricing', value: 'pricing' },
            { id: nanoid(), label: 'Delivery speed', value: 'delivery' },
            { id: nanoid(), label: 'Website experience', value: 'website' },
          ],
        }),
        field('textarea', 'Additional Comments', { placeholder: 'Tell us more...', rows: 4, helperText: '' }),
        field('email', 'Email (optional)', { placeholder: 'you@example.com', helperText: "Only if you'd like a reply" }),
      ],
      settings: { submitButtonText: 'Submit Feedback', successMessage: 'Thank you for your feedback! We appreciate it.', layout: 'vertical', multiStep: false, theme: 'orange' },
    }),
  },

  // ─────────────────────────────────────────────
  // 4. Job Application
  // ─────────────────────────────────────────────
  {
    id: 'job-application',
    label: 'Job Application',
    description: 'Professional application form with resume upload and cover letter.',
    category: 'business',
    icon: '💼',
    color: 'from-gray-700 to-gray-900',
    fields: 9,
    buildSchema: () => ({
      title: 'Job Application',
      description: 'Apply for a position at our company. All fields marked with * are required.',
      components: [
        field('heading', 'Personal Information', { level: 2, content: 'Personal Information' }),
        field('textfield', 'Full Name', { placeholder: 'Jane Smith', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'jane@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('url', 'LinkedIn Profile', { placeholder: 'https://linkedin.com/in/...', helperText: '' }),
        field('divider', 'Divider'),
        field('heading', 'Position Details', { level: 2, content: 'Position Details' }),
        field('select', 'Position Applied For', {
          placeholder: 'Select a role...',
          options: [
            { id: nanoid(), label: 'Frontend Developer', value: 'frontend' },
            { id: nanoid(), label: 'Backend Developer', value: 'backend' },
            { id: nanoid(), label: 'UI/UX Designer', value: 'design' },
            { id: nanoid(), label: 'Product Manager', value: 'pm' },
            { id: nanoid(), label: 'Marketing Specialist', value: 'marketing' },
          ],
        }, required()),
        field('file', 'Resume / CV', { accept: '.pdf,.doc,.docx', multiple: false }, required()),
        field('textarea', 'Cover Letter', { placeholder: 'Tell us why you are a great fit...', rows: 6, helperText: '' }, required()),
      ],
      settings: { submitButtonText: 'Submit Application', successMessage: 'Thank you for applying! We will review your application and be in touch.', layout: 'vertical', multiStep: false, theme: 'dark' },
    }),
  },

  // ─────────────────────────────────────────────
  // 5. Event Registration
  // ─────────────────────────────────────────────
  {
    id: 'event-registration',
    label: 'Event Registration',
    description: 'Register attendees for conferences, webinars, or meetups.',
    category: 'registration',
    icon: '🎟️',
    color: 'from-green-500 to-emerald-600',
    fields: 7,
    buildSchema: () => ({
      title: 'Event Registration',
      description: 'Reserve your spot for our upcoming event. Limited seats available!',
      components: [
        field('heading', 'Event Info', { level: 2, content: 'Register for the Event' }),
        field('textfield', 'Full Name', { placeholder: 'Your full name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: 'Your ticket confirmation will be sent here' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('select', 'Ticket Type', {
          placeholder: 'Select ticket type...',
          options: [
            { id: nanoid(), label: 'General Admission (Free)', value: 'free' },
            { id: nanoid(), label: 'VIP ($49)', value: 'vip' },
            { id: nanoid(), label: 'Workshop Bundle ($99)', value: 'bundle' },
          ],
        }, required()),
        field('number', 'Number of Attendees', { placeholder: '1', min: 1, max: 10, step: 1, helperText: 'Maximum 10 per registration' }),
        field('multiselect', 'Dietary Requirements', {
          options: [
            { id: nanoid(), label: 'Vegetarian', value: 'vegetarian' },
            { id: nanoid(), label: 'Vegan', value: 'vegan' },
            { id: nanoid(), label: 'Gluten-free', value: 'gluten-free' },
            { id: nanoid(), label: 'Halal', value: 'halal' },
            { id: nanoid(), label: 'No requirements', value: 'none' },
          ],
        }),
        field('textarea', 'Special Requests', { placeholder: 'Anything else we should know?', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Register Now', successMessage: "You're registered! Check your email for confirmation.", layout: 'vertical', multiStep: false, theme: 'green' },
    }),
  },

  // ─────────────────────────────────────────────
  // 6. Product Order Form
  // ─────────────────────────────────────────────
  {
    id: 'order',
    label: 'Product Order',
    description: 'Simple order form for products or services with delivery details.',
    category: 'ecommerce',
    icon: '🛒',
    color: 'from-rose-500 to-pink-600',
    fields: 8,
    buildSchema: () => ({
      title: 'Place Your Order',
      description: 'Fill out the form below to place your order. We will confirm via email.',
      components: [
        field('heading', 'Order Details', { level: 2, content: 'Order Details' }),
        field('select', 'Product', {
          placeholder: 'Select a product...',
          options: [
            { id: nanoid(), label: 'Starter Plan — $9/mo', value: 'starter' },
            { id: nanoid(), label: 'Pro Plan — $29/mo', value: 'pro' },
            { id: nanoid(), label: 'Enterprise — $99/mo', value: 'enterprise' },
          ],
        }, required()),
        field('number', 'Quantity', { placeholder: '1', min: 1, max: 100, step: 1, helperText: '' }, required()),
        field('divider', 'Divider'),
        field('heading', 'Shipping Information', { level: 2, content: 'Shipping Information' }),
        field('textfield', 'Full Name', { placeholder: 'Recipient name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: 'Order confirmation will be sent here' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('textarea', 'Delivery Address', { placeholder: 'Street, City, State, ZIP, Country', rows: 3, helperText: '' }, required()),
        field('textarea', 'Order Notes', { placeholder: 'Special instructions...', rows: 2, helperText: '' }),
      ],
      settings: { submitButtonText: 'Place Order', successMessage: 'Order placed! You will receive a confirmation email shortly.', layout: 'vertical', multiStep: false, theme: 'rose' },
    }),
  },

  // ─────────────────────────────────────────────
  // 7. Appointment Booking
  // ─────────────────────────────────────────────
  {
    id: 'appointment',
    label: 'Appointment Booking',
    description: 'Book consultations, medical appointments, or service slots.',
    category: 'business',
    icon: '📅',
    color: 'from-teal-500 to-cyan-600',
    fields: 8,
    buildSchema: () => ({
      title: 'Book an Appointment',
      description: 'Schedule your appointment online. We will confirm your booking shortly.',
      components: [
        field('textfield', 'Full Name', { placeholder: 'Your full name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('select', 'Service', {
          placeholder: 'Choose a service...',
          options: [
            { id: nanoid(), label: 'General Consultation', value: 'general' },
            { id: nanoid(), label: 'Follow-up Visit', value: 'followup' },
            { id: nanoid(), label: 'Specialist Referral', value: 'specialist' },
            { id: nanoid(), label: 'Lab Tests', value: 'lab' },
          ],
        }, required()),
        field('date', 'Preferred Date', { helperText: '' }, required()),
        field('select', 'Preferred Time', {
          placeholder: 'Select a time slot...',
          options: [
            { id: nanoid(), label: '9:00 AM', value: '09:00' },
            { id: nanoid(), label: '10:00 AM', value: '10:00' },
            { id: nanoid(), label: '11:00 AM', value: '11:00' },
            { id: nanoid(), label: '2:00 PM', value: '14:00' },
            { id: nanoid(), label: '3:00 PM', value: '15:00' },
            { id: nanoid(), label: '4:00 PM', value: '16:00' },
          ],
        }, required()),
        field('radio', 'Appointment Type', {
          options: [
            { id: nanoid(), label: 'In-person', value: 'inperson' },
            { id: nanoid(), label: 'Video call', value: 'video' },
            { id: nanoid(), label: 'Phone call', value: 'phone' },
          ],
        }, required()),
        field('textarea', 'Reason for Visit', { placeholder: 'Briefly describe why you are booking...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Book Appointment', successMessage: 'Appointment requested! We will confirm by email within 24 hours.', layout: 'vertical', multiStep: false, theme: 'green' },
    }),
  },

  // ─────────────────────────────────────────────
  // 8. Newsletter Signup
  // ─────────────────────────────────────────────
  {
    id: 'newsletter',
    label: 'Newsletter Signup',
    description: 'Grow your email list with a clean subscription form.',
    category: 'personal',
    icon: '📰',
    color: 'from-indigo-500 to-violet-600',
    fields: 4,
    buildSchema: () => ({
      title: 'Stay in the Loop',
      description: 'Subscribe to our newsletter and get the latest updates delivered to your inbox.',
      components: [
        field('heading', 'Subscribe', { level: 2, content: 'Subscribe to Our Newsletter' }),
        field('paragraph', 'Intro', { content: 'No spam, ever. Unsubscribe at any time.' }),
        field('textfield', 'First Name', { placeholder: 'Your first name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('multiselect', 'Topics You Care About', {
          options: [
            { id: nanoid(), label: 'Product Updates', value: 'product' },
            { id: nanoid(), label: 'Industry News', value: 'news' },
            { id: nanoid(), label: 'Tutorials & Tips', value: 'tutorials' },
            { id: nanoid(), label: 'Promotions & Offers', value: 'promotions' },
          ],
        }),
        field('toggle', 'Weekly Digest', { helperText: 'Receive a weekly roundup instead of individual emails' }),
      ],
      settings: { submitButtonText: 'Subscribe Now', successMessage: "You're subscribed! Welcome to the community.", layout: 'vertical', multiStep: false, theme: 'purple' },
    }),
  },

  // ─────────────────────────────────────────────
  // 9. Bug Report Form
  // ─────────────────────────────────────────────
  {
    id: 'bug-report',
    label: 'Bug Report',
    description: 'Technical issue reporting form with steps to reproduce and severity.',
    category: 'business',
    icon: '🐛',
    color: 'from-red-500 to-red-700',
    fields: 7,
    buildSchema: () => ({
      title: 'Report a Bug',
      description: 'Help us fix issues faster by providing detailed information.',
      components: [
        field('heading', 'Bug Report', { level: 2, content: 'Report a Bug' }),
        field('textfield', 'Bug Title', { placeholder: 'Short description of the issue', helperText: '' }, required()),
        field('select', 'Severity', {
          placeholder: 'How severe is this bug?',
          options: [
            { id: nanoid(), label: 'Critical — App is unusable', value: 'critical' },
            { id: nanoid(), label: 'High — Major feature broken', value: 'high' },
            { id: nanoid(), label: 'Medium — Feature partially works', value: 'medium' },
            { id: nanoid(), label: 'Low — Minor issue or cosmetic', value: 'low' },
          ],
        }, required()),
        field('select', 'Environment', {
          placeholder: 'Where did you encounter this?',
          options: [
            { id: nanoid(), label: 'Production', value: 'production' },
            { id: nanoid(), label: 'Staging', value: 'staging' },
            { id: nanoid(), label: 'Development', value: 'development' },
          ],
        }),
        field('textarea', 'Steps to Reproduce', { placeholder: '1. Go to...\n2. Click on...\n3. See error', rows: 5, helperText: '' }, required()),
        field('textarea', 'Expected Behaviour', { placeholder: 'What should have happened?', rows: 3, helperText: '' }, required()),
        field('textarea', 'Actual Behaviour', { placeholder: 'What actually happened?', rows: 3, helperText: '' }, required()),
        field('file', 'Screenshot / Recording', { accept: 'image/*,video/*', multiple: true }),
        field('email', 'Your Email (for updates)', { placeholder: 'you@example.com', helperText: '' }),
      ],
      settings: { submitButtonText: 'Submit Bug Report', successMessage: 'Bug reported! Our team will investigate and update you.', layout: 'vertical', multiStep: false, theme: 'red' },
    }),
  },

  // ─────────────────────────────────────────────
  // 10. Patient Intake Form
  // ─────────────────────────────────────────────
  {
    id: 'patient-intake',
    label: 'Patient Intake',
    description: 'Medical patient intake form with health history and emergency contact.',
    category: 'business',
    icon: '🏥',
    color: 'from-sky-500 to-blue-600',
    fields: 10,
    buildSchema: () => ({
      title: 'Patient Intake Form',
      description: 'Please complete all fields accurately. Your information is kept private and secure.',
      components: [
        field('heading', 'Patient Information', { level: 2, content: 'Patient Information' }),
        field('textfield', 'Patient Full Name', { placeholder: 'Legal full name', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('radio', 'Gender', {
          options: [
            { id: nanoid(), label: 'Male', value: 'male' },
            { id: nanoid(), label: 'Female', value: 'female' },
            { id: nanoid(), label: 'Non-Binary', value: 'nonbinary' },
            { id: nanoid(), label: 'Prefer not to say', value: 'unspecified' },
          ],
        }),
        field('email', 'Email Address', { placeholder: 'patient@example.com', helperText: '' }),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('divider', 'Divider'),
        field('heading', 'Emergency Contact', { level: 3, content: 'Emergency Contact' }),
        field('textfield', 'Emergency Contact Name', { placeholder: 'Full name', helperText: '' }, required()),
        field('phone', 'Emergency Contact Phone', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('divider', 'Divider'),
        field('heading', 'Health Information', { level: 3, content: 'Health Information' }),
        field('textarea', 'Current Medications', { placeholder: 'List any medications you are currently taking', rows: 3, helperText: '' }),
        field('textarea', 'Known Allergies', { placeholder: 'List any known allergies', rows: 2, helperText: '' }),
        field('textarea', 'Reason for Visit', { placeholder: 'Briefly describe your symptoms or reason for visit', rows: 4, helperText: '' }, required()),
        field('signature', 'Patient Signature', { helperText: 'By signing, you confirm the information provided is accurate' }),
      ],
      settings: { submitButtonText: 'Submit Intake Form', successMessage: 'Form received. A staff member will be with you shortly.', layout: 'vertical', multiStep: false, theme: 'blue' },
    }),
  },

  // ─────────────────────────────────────────────
  // 11. Volunteer Application
  // ─────────────────────────────────────────────
  {
    id: 'volunteer',
    label: 'Volunteer Application',
    description: 'Recruit volunteers with availability, skills, and motivation fields.',
    category: 'nonprofit',
    icon: '🤝',
    color: 'from-green-500 to-lime-600',
    fields: 8,
    buildSchema: () => ({
      title: 'Volunteer Application',
      description: 'Thank you for your interest in volunteering with us! Please complete the form below.',
      components: [
        field('textfield', 'Full Name', { placeholder: 'Your full name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('multiselect', 'Areas You Can Help With', {
          options: [
            { id: nanoid(), label: 'Event Management', value: 'events' },
            { id: nanoid(), label: 'Fundraising', value: 'fundraising' },
            { id: nanoid(), label: 'Administration', value: 'admin' },
            { id: nanoid(), label: 'Marketing & Social Media', value: 'marketing' },
            { id: nanoid(), label: 'IT & Tech Support', value: 'tech' },
            { id: nanoid(), label: 'Teaching / Mentoring', value: 'teaching' },
          ],
        }, required()),
        field('multiselect', 'Availability', {
          options: [
            { id: nanoid(), label: 'Weekday Mornings', value: 'wkday-morning' },
            { id: nanoid(), label: 'Weekday Afternoons', value: 'wkday-afternoon' },
            { id: nanoid(), label: 'Weekday Evenings', value: 'wkday-evening' },
            { id: nanoid(), label: 'Saturday', value: 'saturday' },
            { id: nanoid(), label: 'Sunday', value: 'sunday' },
          ],
        }),
        field('number', 'Hours Available Per Week', { placeholder: '5', min: 1, max: 40, helperText: 'Approximate hours' }),
        field('textarea', 'Why do you want to volunteer with us?', { placeholder: 'Tell us your motivation...', rows: 4, helperText: '' }, required()),
        field('textarea', 'Relevant Skills or Experience', { placeholder: 'Previous volunteer work, skills, certifications...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Submit Application', successMessage: "Thank you for applying! We'll be in touch within a few days.", layout: 'vertical', multiStep: false, theme: 'green' },
    }),
  },

  // ─────────────────────────────────────────────
  // 12. Course Enrollment
  // ─────────────────────────────────────────────
  {
    id: 'course-enrollment',
    label: 'Course Enrollment',
    description: 'Register students for courses with schedule and payment information.',
    category: 'education',
    icon: '🎓',
    color: 'from-blue-600 to-indigo-700',
    fields: 8,
    buildSchema: () => ({
      title: 'Course Enrollment',
      description: 'Complete the form below to enroll in your chosen course.',
      components: [
        field('heading', 'Student Information', { level: 2, content: 'Student Information' }),
        field('textfield', "Student's Full Name", { placeholder: 'Full legal name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'student@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }),
        field('divider', 'Divider'),
        field('heading', 'Course Selection', { level: 2, content: 'Course Selection' }),
        field('select', 'Course', {
          placeholder: 'Select a course...',
          options: [
            { id: nanoid(), label: 'Introduction to Programming', value: 'intro-prog' },
            { id: nanoid(), label: 'Data Science Fundamentals', value: 'data-sci' },
            { id: nanoid(), label: 'Web Development Bootcamp', value: 'web-dev' },
            { id: nanoid(), label: 'Digital Marketing', value: 'digital-mktg' },
            { id: nanoid(), label: 'Business Analytics', value: 'biz-analytics' },
          ],
        }, required()),
        field('radio', 'Schedule', {
          options: [
            { id: nanoid(), label: 'Weekday Morning (9am–12pm)', value: 'wkday-morning' },
            { id: nanoid(), label: 'Weekday Evening (6pm–9pm)', value: 'wkday-evening' },
            { id: nanoid(), label: 'Weekend (10am–4pm)', value: 'weekend' },
          ],
        }, required()),
        field('radio', 'Learning Mode', {
          options: [
            { id: nanoid(), label: 'In-Person', value: 'inperson' },
            { id: nanoid(), label: 'Online', value: 'online' },
            { id: nanoid(), label: 'Hybrid', value: 'hybrid' },
          ],
        }, required()),
        field('signature', 'Enrollment Agreement', { helperText: 'I agree to the course terms and payment policy' }),
      ],
      settings: { submitButtonText: 'Enroll Now', successMessage: "Enrollment received! You'll get a confirmation email with next steps.", layout: 'vertical', multiStep: false, theme: 'blue' },
    }),
  },

  // ─────────────────────────────────────────────
  // 13. Liability Waiver
  // ─────────────────────────────────────────────
  {
    id: 'liability-waiver',
    label: 'Liability Waiver',
    description: 'Activity or event waiver with risk acknowledgement and digital signature.',
    category: 'legal',
    icon: '📋',
    color: 'from-slate-600 to-slate-800',
    fields: 8,
    buildSchema: () => ({
      title: 'Liability Waiver',
      description: 'Please read and complete this form before participating in the activity.',
      components: [
        field('textfield', 'Participant Full Name', { placeholder: 'Legal full name', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'participant@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Activity / Event Name', { placeholder: 'Name of activity or event', helperText: '' }, required()),
        field('date', 'Activity Date', { helperText: '' }, required()),
        field('textfield', 'Emergency Contact Name', { placeholder: 'Emergency contact full name', helperText: '' }, required()),
        field('phone', 'Emergency Contact Phone', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('radio', 'Any medical conditions we should know about?', {
          options: [
            { id: nanoid(), label: 'Yes', value: 'yes' },
            { id: nanoid(), label: 'No', value: 'no' },
          ],
        }, required()),
        field('textarea', 'If yes, please describe', { placeholder: 'Describe any medical conditions or special needs', rows: 3, helperText: '' }),
        field('checkbox', 'Agreement', {
          options: [
            { id: nanoid(), label: 'I have read and agree to the liability waiver terms and conditions', value: 'agree' },
          ],
        }, required()),
        field('signature', 'Participant Signature', { helperText: '' }),
        field('date', 'Signature Date', { helperText: '' }, required()),
      ],
      settings: { submitButtonText: 'Submit Waiver', successMessage: 'Waiver received and recorded. Thank you!', layout: 'vertical', multiStep: false, theme: 'dark' },
    }),
  },

  // ─────────────────────────────────────────────
  // 14. Employee Survey
  // ─────────────────────────────────────────────
  {
    id: 'employee-survey',
    label: 'Employee Survey',
    description: 'Anonymous team engagement and satisfaction survey.',
    category: 'feedback',
    icon: '👥',
    color: 'from-violet-500 to-purple-700',
    fields: 8,
    buildSchema: () => ({
      title: 'Employee Satisfaction Survey',
      description: 'Your responses are anonymous and help us improve our workplace.',
      components: [
        field('heading', 'About Your Role', { level: 2, content: 'About Your Role' }),
        field('select', 'Department', {
          placeholder: 'Select your department',
          options: [
            { id: nanoid(), label: 'Engineering', value: 'engineering' },
            { id: nanoid(), label: 'Marketing', value: 'marketing' },
            { id: nanoid(), label: 'Sales', value: 'sales' },
            { id: nanoid(), label: 'HR', value: 'hr' },
            { id: nanoid(), label: 'Finance', value: 'finance' },
            { id: nanoid(), label: 'Operations', value: 'operations' },
          ],
        }, required()),
        field('rating', 'Overall Job Satisfaction', { maxRating: 5, helperText: '' }, required()),
        field('rating', 'Work-Life Balance', { maxRating: 5, helperText: '' }, required()),
        field('rating', 'Management & Leadership', { maxRating: 5, helperText: '' }, required()),
        field('rating', 'Career Growth Opportunities', { maxRating: 5, helperText: '' }, required()),
        field('radio', 'Do you see yourself here in 2 years?', {
          options: [
            { id: nanoid(), label: 'Yes, definitely', value: 'yes' },
            { id: nanoid(), label: 'Probably', value: 'probably' },
            { id: nanoid(), label: 'Unsure', value: 'unsure' },
            { id: nanoid(), label: 'No', value: 'no' },
          ],
        }, required()),
        field('textarea', 'What could we improve?', { placeholder: 'Share your honest feedback...', rows: 4, helperText: '' }),
        field('textarea', 'What do you appreciate most about working here?', { placeholder: 'Tell us what we are doing well...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Submit Survey', successMessage: 'Thank you for your feedback. Your input makes a difference!', layout: 'vertical', multiStep: false, theme: 'purple' },
    }),
  },

  // ─────────────────────────────────────────────
  // 15. Custom Design Request
  // ─────────────────────────────────────────────
  {
    id: 'design-request',
    label: 'Custom Design Request',
    description: 'Capture client briefs for custom graphic design or print orders.',
    category: 'ecommerce',
    icon: '🎨',
    color: 'from-fuchsia-500 to-pink-600',
    fields: 7,
    buildSchema: () => ({
      title: 'Custom Design Request',
      description: 'Tell us about your design project. The more detail, the better!',
      components: [
        field('textfield', 'Your Name', { placeholder: 'Full name', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('select', 'Product Type', {
          placeholder: 'What do you need designed?',
          options: [
            { id: nanoid(), label: 'T-Shirt / Apparel', value: 'apparel' },
            { id: nanoid(), label: 'Logo / Brand Identity', value: 'logo' },
            { id: nanoid(), label: 'Social Media Graphics', value: 'social' },
            { id: nanoid(), label: 'Flyer / Poster', value: 'print' },
            { id: nanoid(), label: 'Business Card', value: 'bizcard' },
            { id: nanoid(), label: 'Mug / Merchandise', value: 'merch' },
          ],
        }, required()),
        field('number', 'Quantity', { placeholder: '1', min: 1, helperText: '' }, required()),
        field('textarea', 'Design Brief', { placeholder: 'Describe your vision, colours, text, style...', rows: 6, helperText: '' }, required()),
        field('file', 'Reference Files / Logos', { accept: 'image/*,.pdf,.ai,.psd', multiple: true }),
        field('date', 'Required By Date', { helperText: 'Leave blank if flexible' }),
        field('radio', 'Rush Order?', {
          options: [
            { id: nanoid(), label: 'Yes — I need it ASAP (+$20)', value: 'rush' },
            { id: nanoid(), label: 'No — Standard turnaround', value: 'standard' },
          ],
        }, required()),
      ],
      settings: { submitButtonText: 'Submit Design Brief', successMessage: "Request received! We'll send a quote within 24 hours.", layout: 'vertical', multiStep: false, theme: 'pink' },
    }),
  },

  // ─────────────────────────────────────────────
  // 16. School Admission
  // ─────────────────────────────────────────────
  {
    id: 'school-admission',
    label: 'School Admission',
    description: 'Comprehensive admission application for schools and colleges.',
    category: 'education',
    icon: '🏫',
    color: 'from-amber-500 to-orange-600',
    fields: 10,
    buildSchema: () => ({
      title: 'Admission Application',
      description: 'Please complete all sections. Incomplete applications may not be processed.',
      components: [
        field('heading', "Applicant's Details", { level: 2, content: "Applicant's Details" }),
        field('textfield', "Applicant's Full Name", { placeholder: 'Legal full name', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('radio', 'Gender', {
          options: [
            { id: nanoid(), label: 'Male', value: 'male' },
            { id: nanoid(), label: 'Female', value: 'female' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }),
        field('select', 'Grade / Year Applying For', {
          placeholder: 'Select grade...',
          options: [
            { id: nanoid(), label: 'Kindergarten', value: 'kindergarten' },
            ...Array.from({ length: 12 }, (_, i) => ({
              id: nanoid(),
              label: `Grade ${i + 1}`,
              value: `grade-${i + 1}`,
            })),
          ],
        }, required()),
        field('divider', 'Divider'),
        field('heading', "Parent / Guardian Details", { level: 2, content: "Parent / Guardian Details" }),
        field('textfield', 'Parent / Guardian Full Name', { placeholder: 'Full name', helperText: '' }, required()),
        field('email', 'Parent / Guardian Email', { placeholder: 'parent@example.com', helperText: '' }, [
          { id: nanoid(), type: 'required', message: '' },
          { id: nanoid(), type: 'email', message: '' },
        ]),
        field('phone', 'Parent / Guardian Phone', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Previous School / Institution', { placeholder: 'Name of last school attended', helperText: '' }),
        field('file', 'Upload Previous Report Card', { accept: '.pdf,.jpg,.png', multiple: false }),
        field('textarea', 'Why do you wish to join our institution?', { placeholder: 'Optional personal statement...', rows: 4, helperText: '' }),
        field('signature', 'Guardian Signature', { helperText: 'I confirm the information provided is accurate' }),
      ],
      settings: { submitButtonText: 'Submit Application', successMessage: 'Application submitted! We will contact you within 5 business days.', layout: 'vertical', multiStep: false, theme: 'blue' },
    }),
  },

  // ─────────────────────────────────────────────
  // 17. Fitness Class Signup
  // ─────────────────────────────────────────────
  {
    id: 'fitness-class',
    label: 'Fitness Class Signup',
    description: 'Registration form for gym classes with schedule preferences.',
    category: 'fitness',
    icon: '🏋️',
    color: 'from-orange-500 to-red-500',
    fields: 8,
    buildSchema: () => ({
      title: 'Fitness Class Registration',
      description: 'Join our fitness classes today!',
      components: [
        field('heading', 'Fitness Class Signup', { level: 2, content: 'Fitness Class Registration' }),
        field('paragraph', 'Intro', { content: 'Sign up for your preferred fitness classes.' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('select', 'Class Type', {
          placeholder: 'Select a class...',
          options: [
            { id: nanoid(), label: 'Yoga', value: 'yoga' },
            { id: nanoid(), label: 'Pilates', value: 'pilates' },
            { id: nanoid(), label: 'HIIT', value: 'hiit' },
            { id: nanoid(), label: 'Spinning', value: 'spinning' },
            { id: nanoid(), label: 'Zumba', value: 'zumba' },
          ],
        }, required()),
        field('select', 'Preferred Time', {
          placeholder: 'Select time slot...',
          options: [
            { id: nanoid(), label: 'Morning (6am - 9am)', value: 'morning' },
            { id: nanoid(), label: 'Midday (11am - 2pm)', value: 'midday' },
            { id: nanoid(), label: 'Evening (5pm - 8pm)', value: 'evening' },
          ],
        }, required()),
        field('textarea', 'Health Conditions', { placeholder: 'List any health conditions we should know about...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Register Now', successMessage: 'You have been registered! Check your email for confirmation.', layout: 'vertical', multiStep: false, theme: 'orange' },
    }),
  },

  // ─────────────────────────────────────────────
  // 18. Gym Membership Application
  // ─────────────────────────────────────────────
  {
    id: 'gym-membership',
    label: 'Gym Membership',
    description: 'Comprehensive gym membership application form.',
    category: 'fitness',
    icon: '💪',
    color: 'from-red-500 to-pink-500',
    fields: 10,
    buildSchema: () => ({
      title: 'Gym Membership Application',
      description: 'Start your fitness journey with us!',
      components: [
        field('heading', 'Membership Application', { level: 2, content: 'Gym Membership Application' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: 'Must be 16 or older' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Emergency Contact', { placeholder: 'Name and phone number', helperText: '' }, required()),
        field('select', 'Membership Plan', {
          placeholder: 'Select a plan...',
          options: [
            { id: nanoid(), label: 'Basic - $29/month', value: 'basic' },
            { id: nanoid(), label: 'Standard - $49/month', value: 'standard' },
            { id: nanoid(), label: 'Premium - $79/month', value: 'premium' },
            { id: nanoid(), label: 'Annual - $499/year', value: 'annual' },
          ],
        }, required()),
        field('checkbox', 'Agree to Terms', { label: 'I agree to the terms and conditions' }, required()),
        field('signature', 'Signature', { helperText: 'Sign to confirm membership' }),
      ],
      settings: { submitButtonText: 'Apply for Membership', successMessage: 'Welcome! Your membership is being processed.', layout: 'vertical', multiStep: false, theme: 'red' },
    }),
  },

  // ─────────────────────────────────────────────
  // 19. Restaurant Reservation
  // ─────────────────────────────────────────────
  {
    id: 'restaurant-reservation',
    label: 'Restaurant Reservation',
    description: 'Table booking form for restaurants.',
    category: 'restaurant',
    icon: '🍽️',
    color: 'from-amber-500 to-orange-500',
    fields: 7,
    buildSchema: () => ({
      title: 'Table Reservation',
      description: 'Book your table in advance.',
      components: [
        field('heading', 'Table Reservation', { level: 2, content: 'Reserve Your Table' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('date', 'Reservation Date', { helperText: '' }, required()),
        field('select', 'Time Slot', {
          placeholder: 'Select time...',
          options: [
            { id: nanoid(), label: '12:00 PM', value: '12:00' },
            { id: nanoid(), label: '1:00 PM', value: '13:00' },
            { id: nanoid(), label: '6:00 PM', value: '18:00' },
            { id: nanoid(), label: '7:00 PM', value: '19:00' },
            { id: nanoid(), label: '8:00 PM', value: '20:00' },
          ],
        }, required()),
        field('number', 'Number of Guests', { placeholder: '2', min: 1, max: 20, helperText: '' }, required()),
        field('textarea', 'Special Requests', { placeholder: 'Allergies, special occasions, seating preferences...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Book Table', successMessage: 'Your reservation is confirmed! See you soon.', layout: 'vertical', multiStep: false, theme: 'amber' },
    }),
  },

  // ─────────────────────────────────────────────
  // 20. Food Order Form
  // ─────────────────────────────────────────────
  {
    id: 'food-order',
    label: 'Food Order Form',
    description: 'Online food ordering for takeout or delivery.',
    category: 'restaurant',
    icon: '🍕',
    color: 'from-yellow-500 to-amber-500',
    fields: 9,
    buildSchema: () => ({
      title: 'Order Food Online',
      description: 'Choose your favorite dishes!',
      components: [
        field('heading', 'Food Order', { level: 2, content: 'Place Your Order' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Delivery Address', { placeholder: '123 Main St, City', helperText: '' }, required()),
        field('select', 'Order Type', {
          placeholder: 'Select order type...',
          options: [
            { id: nanoid(), label: 'Delivery', value: 'delivery' },
            { id: nanoid(), label: 'Pickup', value: 'pickup' },
          ],
        }, required()),
        field('checkbox', 'Menu Items', { label: 'Margherita Pizza - $12', helperText: '' }),
        field('checkbox', 'Menu Items', { label: 'Pasta Carbonara - $15', helperText: '' }),
        field('checkbox', 'Menu Items', { label: 'Caesar Salad - $8', helperText: '' }),
        field('textarea', 'Special Instructions', { placeholder: 'Extra sauce, no onions, etc...', rows: 2, helperText: '' }),
      ],
      settings: { submitButtonText: 'Place Order', successMessage: 'Order received! We will contact you shortly.', layout: 'vertical', multiStep: false, theme: 'yellow' },
    }),
  },

  // ─────────────────────────────────────────────
  // 21. Property Inquiry
  // ─────────────────────────────────────────────
  {
    id: 'property-inquiry',
    label: 'Property Inquiry',
    description: 'Real estate property inquiry and viewing request.',
    category: 'realestate',
    icon: '🏠',
    color: 'from-teal-500 to-cyan-500',
    fields: 8,
    buildSchema: () => ({
      title: 'Property Inquiry',
      description: 'Interested in a property? Let us know!',
      components: [
        field('heading', 'Property Inquiry', { level: 2, content: 'Property Inquiry Form' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Property Address/ID', { placeholder: 'Enter property address or listing ID', helperText: '' }),
        field('select', 'Inquiry Type', {
          placeholder: 'Select inquiry type...',
          options: [
            { id: nanoid(), label: 'Schedule Viewing', value: 'viewing' },
            { id: nanoid(), label: 'Price Information', value: 'price' },
            { id: nanoid(), label: 'General Question', value: 'general' },
          ],
        }, required()),
        field('select', 'Budget Range', {
          placeholder: 'Select budget range...',
          options: [
            { id: nanoid(), label: 'Under $200,000', value: 'under200k' },
            { id: nanoid(), label: '$200,000 - $500,000', value: '200k-500k' },
            { id: nanoid(), label: '$500,000 - $1,000,000', value: '500k-1m' },
            { id: nanoid(), label: 'Over $1,000,000', value: 'over1m' },
          ],
        }),
        field('textarea', 'Message', { placeholder: 'Tell us what you are looking for...', rows: 4, helperText: '' }),
      ],
      settings: { submitButtonText: 'Submit Inquiry', successMessage: 'Thank you! An agent will contact you within 24 hours.', layout: 'vertical', multiStep: false, theme: 'teal' },
    }),
  },

  // ─────────────────────────────────────────────
  // 22. Travel Booking Inquiry
  // ─────────────────────────────────────────────
  {
    id: 'travel-booking',
    label: 'Travel Booking',
    description: 'Travel and vacation booking inquiry form.',
    category: 'travel',
    icon: '✈️',
    color: 'from-sky-500 to-blue-500',
    fields: 9,
    buildSchema: () => ({
      title: 'Travel Booking Inquiry',
      description: 'Plan your perfect getaway!',
      components: [
        field('heading', 'Travel Inquiry', { level: 2, content: 'Travel Booking Inquiry' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('textfield', 'Destination', { placeholder: 'Where do you want to go?', helperText: '' }, required()),
        field('date', 'Departure Date', { helperText: '' }, required()),
        field('date', 'Return Date', { helperText: '' }, required()),
        field('number', 'Number of Travelers', { placeholder: '2', min: 1, max: 20, helperText: '' }, required()),
        field('textarea', 'Special Requirements', { placeholder: 'Dietary needs, accessibility, activities...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Request Quote', successMessage: 'Your travel inquiry has been received! We will email you a quote.', layout: 'vertical', multiStep: false, theme: 'sky' },
    }),
  },

  // ─────────────────────────────────────────────
  // 23. Hotel Booking
  // ─────────────────────────────────────────────
  {
    id: 'hotel-booking',
    label: 'Hotel Booking',
    description: 'Hotel room reservation form.',
    category: 'travel',
    icon: '🏨',
    color: 'from-indigo-500 to-purple-500',
    fields: 8,
    buildSchema: () => ({
      title: 'Hotel Room Reservation',
      description: 'Book your stay with us.',
      components: [
        field('heading', 'Hotel Reservation', { level: 2, content: 'Book Your Stay' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('date', 'Check-in Date', { helperText: '' }, required()),
        field('date', 'Check-out Date', { helperText: '' }, required()),
        field('select', 'Room Type', {
          placeholder: 'Select room type...',
          options: [
            { id: nanoid(), label: 'Standard Room', value: 'standard' },
            { id: nanoid(), label: 'Deluxe Room', value: 'deluxe' },
            { id: nanoid(), label: 'Suite', value: 'suite' },
            { id: nanoid(), label: 'Presidential Suite', value: 'presidential' },
          ],
        }, required()),
        field('number', 'Number of Guests', { placeholder: '2', min: 1, max: 10, helperText: '' }, required()),
      ],
      settings: { submitButtonText: 'Book Now', successMessage: 'Reservation confirmed! Confirmation email sent.', layout: 'vertical', multiStep: false, theme: 'indigo' },
    }),
  },

  // ─────────────────────────────────────────────
  // 24. Portfolio/Creative Brief
  // ─────────────────────────────────────────────
  {
    id: 'creative-brief',
    label: 'Creative Brief',
    description: 'Project brief form for creative services.',
    category: 'creative',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    fields: 9,
    buildSchema: () => ({
      title: 'Creative Project Brief',
      description: 'Tell us about your creative project.',
      components: [
        field('heading', 'Project Brief', { level: 2, content: 'Creative Project Brief' }),
        field('textfield', 'Your Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('textfield', 'Company/Brand', { placeholder: 'Your company name', helperText: '' }),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('select', 'Project Type', {
          placeholder: 'Select project type...',
          options: [
            { id: nanoid(), label: 'Logo Design', value: 'logo' },
            { id: nanoid(), label: 'Website Design', value: 'website' },
            { id: nanoid(), label: 'Branding', value: 'branding' },
            { id: nanoid(), label: 'Marketing Materials', value: 'marketing' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }, required()),
        field('textarea', 'Project Description', { placeholder: 'Describe your project goals and vision...', rows: 4, helperText: '' }, required()),
        field('select', 'Budget Range', {
          placeholder: 'Select budget...',
          options: [
            { id: nanoid(), label: 'Under $1,000', value: 'under1k' },
            { id: nanoid(), label: '$1,000 - $5,000', value: '1k-5k' },
            { id: nanoid(), label: '$5,000 - $10,000', value: '5k-10k' },
            { id: nanoid(), label: 'Over $10,000', value: 'over10k' },
          ],
        }),
        field('date', 'Deadline', { helperText: 'When do you need this completed?' }),
        field('file', 'Reference Files', { accept: '.pdf,.jpg,.png,.zip', multiple: true }),
      ],
      settings: { submitButtonText: 'Submit Brief', successMessage: 'Brief received! We will review and get back to you.', layout: 'vertical', multiStep: false, theme: 'pink' },
    }),
  },

  // ─────────────────────────────────────────────
  // 25. Pet Grooming Appointment
  // ─────────────────────────────────────────────
  {
    id: 'pet-grooming',
    label: 'Pet Grooming',
    description: 'Pet grooming appointment booking form.',
    category: 'pet',
    icon: '🐕',
    color: 'from-lime-500 to-green-500',
    fields: 9,
    buildSchema: () => ({
      title: 'Pet Grooming Appointment',
      description: 'Book a grooming session for your furry friend!',
      components: [
        field('heading', 'Grooming Appointment', { level: 2, content: 'Pet Grooming Booking' }),
        field('textfield', 'Owner Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Pet Name', { placeholder: "Your pet's name", helperText: '' }, required()),
        field('select', 'Pet Type', {
          placeholder: 'Select pet type...',
          options: [
            { id: nanoid(), label: 'Dog', value: 'dog' },
            { id: nanoid(), label: 'Cat', value: 'cat' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }, required()),
        field('textfield', 'Breed', { placeholder: 'Golden Retriever, Persian, etc.', helperText: '' }),
        field('select', 'Service', {
          placeholder: 'Select service...',
          options: [
            { id: nanoid(), label: 'Full Grooming', value: 'full' },
            { id: nanoid(), label: 'Bath & Brush', value: 'bath' },
            { id: nanoid(), label: 'Nail Trim', value: 'nails' },
            { id: nanoid(), label: 'Haircut Only', value: 'haircut' },
          ],
        }, required()),
        field('date', 'Preferred Date', { helperText: '' }, required()),
        field('textarea', 'Special Notes', { placeholder: 'Any allergies, behavioral notes, or special requests...', rows: 3, helperText: '' }),
      ],
      settings: { submitButtonText: 'Book Appointment', successMessage: 'Appointment booked! We will confirm via phone.', layout: 'vertical', multiStep: false, theme: 'lime' },
    }),
  },

  // ─────────────────────────────────────────────
  // 26. Medical Appointment
  // ─────────────────────────────────────────────
  {
    id: 'medical-appointment',
    label: 'Medical Appointment',
    description: 'Healthcare appointment booking form.',
    category: 'medical',
    icon: '🏥',
    color: 'from-cyan-500 to-blue-500',
    fields: 10,
    buildSchema: () => ({
      title: 'Medical Appointment',
      description: 'Schedule your appointment with our healthcare team.',
      components: [
        field('heading', 'Medical Appointment', { level: 2, content: 'Book Your Appointment' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('select', 'Department', {
          placeholder: 'Select department...',
          options: [
            { id: nanoid(), label: 'General Practice', value: 'general' },
            { id: nanoid(), label: 'Pediatrics', value: 'pediatrics' },
            { id: nanoid(), label: 'Dermatology', value: 'dermatology' },
            { id: nanoid(), label: 'Cardiology', value: 'cardiology' },
            { id: nanoid(), label: 'Orthopedics', value: 'orthopedics' },
          ],
        }, required()),
        field('select', 'Appointment Type', {
          placeholder: 'Select type...',
          options: [
            { id: nanoid(), label: 'New Patient', value: 'new' },
            { id: nanoid(), label: 'Follow-up', value: 'followup' },
            { id: nanoid(), label: 'Consultation', value: 'consultation' },
          ],
        }, required()),
        field('date', 'Preferred Date', { helperText: '' }, required()),
        field('textarea', 'Reason for Visit', { placeholder: 'Briefly describe your symptoms or reason for visit...', rows: 3, helperText: '' }, required()),
        field('checkbox', 'Insurance', { label: 'I have health insurance' }),
      ],
      settings: { submitButtonText: 'Request Appointment', successMessage: 'Appointment request received! We will call to confirm.', layout: 'vertical', multiStep: false, theme: 'cyan' },
    }),
  },

  // ─────────────────────────────────────────────
  // 27. Customer Satisfaction Survey
  // ─────────────────────────────────────────────
  {
    id: 'satisfaction-survey',
    label: 'Satisfaction Survey',
    description: 'Customer satisfaction survey with rating scales.',
    category: 'survey',
    icon: '📊',
    color: 'from-violet-500 to-purple-500',
    fields: 8,
    buildSchema: () => ({
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve by sharing your feedback.',
      components: [
        field('heading', 'Satisfaction Survey', { level: 2, content: 'Customer Satisfaction Survey' }),
        field('paragraph', 'Intro', { content: 'We value your feedback. Please take a moment to rate your experience.' }),
        field('rating', 'Overall Satisfaction', { maxRating: 5, helperText: '1 = Very Dissatisfied, 5 = Very Satisfied' }, required()),
        field('rating', 'Product Quality', { maxRating: 5, helperText: '' }),
        field('rating', 'Customer Service', { maxRating: 5, helperText: '' }),
        field('rating', 'Value for Money', { maxRating: 5, helperText: '' }),
        field('select', 'Would you recommend us?', {
          placeholder: 'Select...',
          options: [
            { id: nanoid(), label: 'Definitely Yes', value: 'yes' },
            { id: nanoid(), label: 'Maybe', value: 'maybe' },
            { id: nanoid(), label: 'No', value: 'no' },
          ],
        }, required()),
        field('textarea', 'Additional Comments', { placeholder: 'Share any additional feedback...', rows: 4, helperText: '' }),
      ],
      settings: { submitButtonText: 'Submit Survey', successMessage: 'Thank you for your feedback!', layout: 'vertical', multiStep: false, theme: 'violet' },
    }),
  },

  // ─────────────────────────────────────────────
  // 28. Employee Onboarding
  // ─────────────────────────────────────────────
  {
    id: 'employee-onboarding',
    label: 'Employee Onboarding',
    description: 'New employee onboarding information form.',
    category: 'business',
    icon: '👔',
    color: 'from-slate-500 to-gray-600',
    fields: 12,
    buildSchema: () => ({
      title: 'Employee Onboarding Form',
      description: 'Welcome! Please fill out your information.',
      components: [
        field('heading', 'Onboarding', { level: 2, content: 'New Employee Information' }),
        field('textfield', 'Full Legal Name', { placeholder: 'John Michael Doe', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('email', 'Personal Email', { placeholder: 'personal@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Address', { placeholder: '123 Main St, City, State ZIP', helperText: '' }, required()),
        field('textfield', 'Emergency Contact Name', { placeholder: 'Full name', helperText: '' }, required()),
        field('phone', 'Emergency Contact Phone', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('date', 'Start Date', { helperText: '' }, required()),
        field('textfield', 'Position/Title', { placeholder: 'Software Engineer', helperText: '' }, required()),
        field('textfield', 'Department', { placeholder: 'Engineering', helperText: '' }),
        field('file', 'Upload ID Document', { accept: '.pdf,.jpg,.png', multiple: false }),
      ],
      settings: { submitButtonText: 'Submit Information', successMessage: 'Information submitted! HR will follow up.', layout: 'vertical', multiStep: false, theme: 'slate' },
    }),
  },

  // ─────────────────────────────────────────────
  // 29. Maintenance Request
  // ─────────────────────────────────────────────
  {
    id: 'maintenance-request',
    label: 'Maintenance Request',
    description: 'Property maintenance and repair request form.',
    category: 'realestate',
    icon: '🔧',
    color: 'from-zinc-500 to-slate-600',
    fields: 8,
    buildSchema: () => ({
      title: 'Maintenance Request',
      description: 'Report an issue or request repairs.',
      components: [
        field('heading', 'Maintenance Request', { level: 2, content: 'Submit Maintenance Request' }),
        field('textfield', 'Your Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('textfield', 'Unit/Apartment Number', { placeholder: 'Apt 101', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('select', 'Issue Category', {
          placeholder: 'Select category...',
          options: [
            { id: nanoid(), label: 'Plumbing', value: 'plumbing' },
            { id: nanoid(), label: 'Electrical', value: 'electrical' },
            { id: nanoid(), label: 'HVAC', value: 'hvac' },
            { id: nanoid(), label: 'Appliance', value: 'appliance' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }, required()),
        field('select', 'Priority', {
          placeholder: 'Select priority...',
          options: [
            { id: nanoid(), label: 'Emergency', value: 'emergency' },
            { id: nanoid(), label: 'Urgent', value: 'urgent' },
            { id: nanoid(), label: 'Normal', value: 'normal' },
          ],
        }, required()),
        field('textarea', 'Issue Description', { placeholder: 'Describe the issue in detail...', rows: 4, helperText: '' }, required()),
        field('file', 'Photos (optional)', { accept: '.jpg,.png', multiple: true }),
      ],
      settings: { submitButtonText: 'Submit Request', successMessage: 'Request submitted! We will contact you to schedule repairs.', layout: 'vertical', multiStep: false, theme: 'zinc' },
    }),
  },

  // ─────────────────────────────────────────────
  // 30. Webinar Registration
  // ─────────────────────────────────────────────
  {
    id: 'webinar-registration',
    label: 'Webinar Registration',
    description: 'Online webinar or virtual event registration.',
    category: 'education',
    icon: '📹',
    color: 'from-blue-600 to-indigo-600',
    fields: 7,
    buildSchema: () => ({
      title: 'Webinar Registration',
      description: 'Register for our upcoming webinar.',
      components: [
        field('heading', 'Webinar Registration', { level: 2, content: 'Register for Webinar' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('textfield', 'Company/Organization', { placeholder: 'Your company', helperText: '' }),
        field('textfield', 'Job Title', { placeholder: 'Your role', helperText: '' }),
        field('select', 'How did you hear about us?', {
          placeholder: 'Select...',
          options: [
            { id: nanoid(), label: 'Email', value: 'email' },
            { id: nanoid(), label: 'Social Media', value: 'social' },
            { id: nanoid(), label: 'Website', value: 'website' },
            { id: nanoid(), label: 'Colleague', value: 'colleague' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }),
        field('checkbox', 'Newsletter', { label: 'Subscribe to our newsletter for updates' }),
      ],
      settings: { submitButtonText: 'Register Now', successMessage: 'You are registered! Check your email for the webinar link.', layout: 'vertical', multiStep: false, theme: 'blue' },
    }),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-PAGE FORMS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // 31. Multi-Page Job Application
  // ─────────────────────────────────────────────
  {
    id: 'multipage-job-application',
    label: 'Job Application (Multi-Page)',
    description: 'Comprehensive job application with personal info, experience, and documents across multiple pages.',
    category: 'multipage',
    icon: '📋',
    color: 'from-indigo-600 to-blue-600',
    fields: 18,
    buildSchema: () => ({
      title: 'Job Application',
      description: 'Complete your job application in 4 easy steps.',
      components: [
        // PAGE 1: Personal Information
        field('heading', 'Step 1', { level: 2, content: 'Step 1: Personal Information' }),
        field('paragraph', 'Page1Intro', { content: 'Please provide your basic contact details.' }),
        field('textfield', 'Full Name', { placeholder: 'John Michael Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Address', { placeholder: '123 Main St, City, State ZIP', helperText: '' }),
        field('page-break', 'Page Break 1', { label: 'Work Experience' }),

        // PAGE 2: Work Experience
        field('heading', 'Step 2', { level: 2, content: 'Step 2: Work Experience' }),
        field('paragraph', 'Page2Intro', { content: 'Tell us about your professional background.' }),
        field('textfield', 'Current/Last Employer', { placeholder: 'Company name', helperText: '' }),
        field('textfield', 'Job Title', { placeholder: 'Your position', helperText: '' }),
        field('number', 'Years of Experience', { placeholder: '5', min: 0, max: 50, helperText: '' }),
        field('textarea', 'Key Responsibilities', { placeholder: 'Describe your main duties...', rows: 4, helperText: '' }),
        field('page-break', 'Page Break 2', { label: 'Education & Skills' }),

        // PAGE 3: Education & Skills
        field('heading', 'Step 3', { level: 2, content: 'Step 3: Education & Skills' }),
        field('select', 'Highest Education', {
          placeholder: 'Select education level...',
          options: [
            { id: nanoid(), label: 'High School', value: 'highschool' },
            { id: nanoid(), label: "Bachelor's Degree", value: 'bachelors' },
            { id: nanoid(), label: "Master's Degree", value: 'masters' },
            { id: nanoid(), label: 'PhD', value: 'phd' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }, required()),
        field('textfield', 'Field of Study', { placeholder: 'Computer Science, Business, etc.', helperText: '' }),
        field('textarea', 'Skills & Certifications', { placeholder: 'List your relevant skills and certifications...', rows: 3, helperText: '' }),
        field('page-break', 'Page Break 3', { label: 'Documents & Submit' }),

        // PAGE 4: Documents & Submission
        field('heading', 'Step 4', { level: 2, content: 'Step 4: Documents & Submission' }),
        field('file', 'Upload Resume/CV', { accept: '.pdf,.doc,.docx', multiple: false }, required()),
        field('file', 'Cover Letter (Optional)', { accept: '.pdf,.doc,.docx', multiple: false }),
        field('textarea', 'Additional Notes', { placeholder: 'Anything else you would like us to know?', rows: 3, helperText: '' }),
        field('checkbox', 'Agree to Terms', { label: 'I certify that the information provided is accurate and complete' }, required()),
      ],
      settings: { submitButtonText: 'Submit Application', successMessage: 'Application submitted successfully! We will review and contact you.', layout: 'vertical', multiStep: true, theme: 'indigo' },
    }),
  },

  // ─────────────────────────────────────────────
  // 32. Multi-Page Event Registration
  // ─────────────────────────────────────────────
  {
    id: 'multipage-event-registration',
    label: 'Event Registration (Multi-Page)',
    description: 'Conference or event registration with attendee details, sessions, and payment info.',
    category: 'multipage',
    icon: '🎫',
    color: 'from-purple-600 to-pink-600',
    fields: 16,
    buildSchema: () => ({
      title: 'Event Registration',
      description: 'Register for our upcoming event in 3 steps.',
      components: [
        // PAGE 1: Attendee Information
        field('heading', 'Attendee Info', { level: 2, content: 'Step 1: Attendee Information' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('textfield', 'Company/Organization', { placeholder: 'Your company', helperText: '' }),
        field('textfield', 'Job Title', { placeholder: 'Your role', helperText: '' }),
        field('page-break', 'Page Break 1', { label: 'Session Selection' }),

        // PAGE 2: Session Selection
        field('heading', 'Sessions', { level: 2, content: 'Step 2: Select Sessions' }),
        field('paragraph', 'SessionIntro', { content: 'Choose the sessions you would like to attend.' }),
        field('checkbox', 'Session 1', { label: 'Keynote: Future of Technology (9:00 AM)' }),
        field('checkbox', 'Session 2', { label: 'Workshop: Hands-on AI Development (11:00 AM)' }),
        field('checkbox', 'Session 3', { label: 'Panel: Industry Leaders Discussion (2:00 PM)' }),
        field('checkbox', 'Session 4', { label: 'Networking Session (4:00 PM)' }),
        field('select', 'Dietary Requirements', {
          placeholder: 'Select dietary needs...',
          options: [
            { id: nanoid(), label: 'None', value: 'none' },
            { id: nanoid(), label: 'Vegetarian', value: 'vegetarian' },
            { id: nanoid(), label: 'Vegan', value: 'vegan' },
            { id: nanoid(), label: 'Gluten-Free', value: 'glutenfree' },
            { id: nanoid(), label: 'Halal', value: 'halal' },
            { id: nanoid(), label: 'Kosher', value: 'kosher' },
          ],
        }),
        field('page-break', 'Page Break 2', { label: 'Payment & Confirm' }),

        // PAGE 3: Payment & Confirmation
        field('heading', 'Payment', { level: 2, content: 'Step 3: Payment & Confirmation' }),
        field('select', 'Ticket Type', {
          placeholder: 'Select ticket...',
          options: [
            { id: nanoid(), label: 'Early Bird - $99', value: 'earlybird' },
            { id: nanoid(), label: 'Regular - $149', value: 'regular' },
            { id: nanoid(), label: 'VIP - $299', value: 'vip' },
          ],
        }, required()),
        field('textfield', 'Promo Code', { placeholder: 'Enter promo code if you have one', helperText: '' }),
        field('checkbox', 'Terms', { label: 'I agree to the event terms and conditions' }, required()),
        field('checkbox', 'Newsletter', { label: 'Subscribe to updates about future events' }),
      ],
      settings: { submitButtonText: 'Complete Registration', successMessage: 'You are registered! Confirmation email sent.', layout: 'vertical', multiStep: true, theme: 'purple' },
    }),
  },

  // ─────────────────────────────────────────────
  // 33. Multi-Page Customer Onboarding
  // ─────────────────────────────────────────────
  {
    id: 'multipage-customer-onboarding',
    label: 'Customer Onboarding (Multi-Page)',
    description: 'Complete customer onboarding with company info, preferences, and setup.',
    category: 'multipage',
    icon: '🚀',
    color: 'from-teal-500 to-emerald-500',
    fields: 17,
    buildSchema: () => ({
      title: 'Customer Onboarding',
      description: 'Welcome! Let us set up your account in 3 steps.',
      components: [
        // PAGE 1: Company Information
        field('heading', 'Company Info', { level: 2, content: 'Step 1: Company Information' }),
        field('paragraph', 'WelcomeText', { content: 'Tell us about your company so we can customize your experience.' }),
        field('textfield', 'Company Name', { placeholder: 'Acme Corporation', helperText: '' }, required()),
        field('textfield', 'Website', { placeholder: 'https://yourcompany.com', helperText: '' }),
        field('select', 'Industry', {
          placeholder: 'Select your industry...',
          options: [
            { id: nanoid(), label: 'Technology', value: 'tech' },
            { id: nanoid(), label: 'Healthcare', value: 'healthcare' },
            { id: nanoid(), label: 'Finance', value: 'finance' },
            { id: nanoid(), label: 'Retail', value: 'retail' },
            { id: nanoid(), label: 'Manufacturing', value: 'manufacturing' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }, required()),
        field('select', 'Company Size', {
          placeholder: 'Select company size...',
          options: [
            { id: nanoid(), label: '1-10 employees', value: '1-10' },
            { id: nanoid(), label: '11-50 employees', value: '11-50' },
            { id: nanoid(), label: '51-200 employees', value: '51-200' },
            { id: nanoid(), label: '201-1000 employees', value: '201-1000' },
            { id: nanoid(), label: '1000+ employees', value: '1000+' },
          ],
        }),
        field('page-break', 'Page Break 1', { label: 'Primary Contact' }),

        // PAGE 2: Primary Contact
        field('heading', 'Contact', { level: 2, content: 'Step 2: Primary Contact' }),
        field('textfield', 'Contact Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('email', 'Contact Email', { placeholder: 'john@company.com', helperText: '' }, required()),
        field('phone', 'Contact Phone', { placeholder: '+1 (000) 000-0000', helperText: '' }),
        field('textfield', 'Job Title', { placeholder: 'CTO, Manager, etc.', helperText: '' }),
        field('page-break', 'Page Break 2', { label: 'Preferences' }),

        // PAGE 3: Preferences & Setup
        field('heading', 'Preferences', { level: 2, content: 'Step 3: Preferences & Setup' }),
        field('select', 'How did you hear about us?', {
          placeholder: 'Select...',
          options: [
            { id: nanoid(), label: 'Google Search', value: 'google' },
            { id: nanoid(), label: 'Social Media', value: 'social' },
            { id: nanoid(), label: 'Referral', value: 'referral' },
            { id: nanoid(), label: 'Conference/Event', value: 'event' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }),
        field('textarea', 'What are your main goals?', { placeholder: 'Tell us what you hope to achieve...', rows: 3, helperText: '' }),
        field('checkbox', 'Marketing', { label: 'Receive product updates and tips via email' }),
        field('checkbox', 'Terms', { label: 'I agree to the Terms of Service and Privacy Policy' }, required()),
      ],
      settings: { submitButtonText: 'Complete Setup', successMessage: 'Welcome aboard! Your account is ready.', layout: 'vertical', multiStep: true, theme: 'teal' },
    }),
  },

  // ─────────────────────────────────────────────
  // 34. Multi-Page Insurance Quote
  // ─────────────────────────────────────────────
  {
    id: 'multipage-insurance-quote',
    label: 'Insurance Quote (Multi-Page)',
    description: 'Insurance quote request with personal info, coverage needs, and vehicle/property details.',
    category: 'multipage',
    icon: '🛡️',
    color: 'from-blue-600 to-cyan-500',
    fields: 20,
    buildSchema: () => ({
      title: 'Insurance Quote Request',
      description: 'Get a personalized insurance quote in 4 steps.',
      components: [
        // PAGE 1: Personal Information
        field('heading', 'Personal Info', { level: 2, content: 'Step 1: Personal Information' }),
        field('textfield', 'Full Name', { placeholder: 'John Doe', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Address', { placeholder: '123 Main St, City, State ZIP', helperText: '' }, required()),
        field('page-break', 'Page Break 1', { label: 'Insurance Type' }),

        // PAGE 2: Insurance Type
        field('heading', 'Insurance Type', { level: 2, content: 'Step 2: Insurance Type' }),
        field('select', 'Type of Insurance', {
          placeholder: 'Select insurance type...',
          options: [
            { id: nanoid(), label: 'Auto Insurance', value: 'auto' },
            { id: nanoid(), label: 'Home Insurance', value: 'home' },
            { id: nanoid(), label: 'Life Insurance', value: 'life' },
            { id: nanoid(), label: 'Health Insurance', value: 'health' },
            { id: nanoid(), label: 'Business Insurance', value: 'business' },
          ],
        }, required()),
        field('select', 'Coverage Level', {
          placeholder: 'Select coverage level...',
          options: [
            { id: nanoid(), label: 'Basic', value: 'basic' },
            { id: nanoid(), label: 'Standard', value: 'standard' },
            { id: nanoid(), label: 'Premium', value: 'premium' },
            { id: nanoid(), label: 'Comprehensive', value: 'comprehensive' },
          ],
        }, required()),
        field('page-break', 'Page Break 2', { label: 'Property/Vehicle Details' }),

        // PAGE 3: Property/Vehicle Details
        field('heading', 'Details', { level: 2, content: 'Step 3: Property/Vehicle Details' }),
        field('paragraph', 'DetailsIntro', { content: 'Provide details about what you want to insure.' }),
        field('textfield', 'Make/Manufacturer', { placeholder: 'Toyota, Samsung, etc.', helperText: 'For auto: car make; For home: builder/manufacturer' }),
        field('textfield', 'Model/Type', { placeholder: 'Camry, Single Family Home, etc.', helperText: '' }),
        field('textfield', 'Year', { placeholder: '2022', helperText: '' }),
        field('number', 'Estimated Value', { placeholder: '25000', min: 0, helperText: 'Estimated value in USD' }),
        field('page-break', 'Page Break 3', { label: 'Additional Info' }),

        // PAGE 4: Additional Information
        field('heading', 'Additional', { level: 2, content: 'Step 4: Additional Information' }),
        field('textarea', 'Current Insurance', { placeholder: 'Do you currently have insurance? Provider name and policy number if applicable...', rows: 2, helperText: '' }),
        field('select', 'Preferred Contact Method', {
          placeholder: 'How should we contact you?',
          options: [
            { id: nanoid(), label: 'Email', value: 'email' },
            { id: nanoid(), label: 'Phone', value: 'phone' },
            { id: nanoid(), label: 'Text/SMS', value: 'sms' },
          ],
        }),
        field('textarea', 'Additional Notes', { placeholder: 'Any other information you want to share...', rows: 3, helperText: '' }),
        field('checkbox', 'Consent', { label: 'I consent to being contacted for insurance quotes' }, required()),
      ],
      settings: { submitButtonText: 'Get My Quote', successMessage: 'Quote request received! An agent will contact you within 24 hours.', layout: 'vertical', multiStep: true, theme: 'blue' },
    }),
  },

  // ─────────────────────────────────────────────
  // 35. Multi-Page Patient Intake
  // ─────────────────────────────────────────────
  {
    id: 'multipage-patient-intake',
    label: 'Patient Intake (Multi-Page)',
    description: 'Medical patient intake form with personal info, medical history, and insurance.',
    category: 'multipage',
    icon: '🏥',
    color: 'from-red-500 to-pink-500',
    fields: 22,
    buildSchema: () => ({
      title: 'Patient Intake Form',
      description: 'Please complete this form before your appointment.',
      components: [
        // PAGE 1: Personal Information
        field('heading', 'Personal Info', { level: 2, content: 'Step 1: Personal Information' }),
        field('textfield', 'Full Legal Name', { placeholder: 'John Michael Doe', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: '' }, required()),
        field('select', 'Gender', {
          placeholder: 'Select...',
          options: [
            { id: nanoid(), label: 'Male', value: 'male' },
            { id: nanoid(), label: 'Female', value: 'female' },
            { id: nanoid(), label: 'Other', value: 'other' },
            { id: nanoid(), label: 'Prefer not to say', value: 'undisclosed' },
          ],
        }),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }),
        field('textfield', 'Address', { placeholder: '123 Main St, City, State ZIP', helperText: '' }, required()),
        field('page-break', 'Page Break 1', { label: 'Emergency Contact' }),

        // PAGE 2: Emergency Contact
        field('heading', 'Emergency Contact', { level: 2, content: 'Step 2: Emergency Contact' }),
        field('textfield', 'Emergency Contact Name', { placeholder: 'Full name', helperText: '' }, required()),
        field('textfield', 'Relationship', { placeholder: 'Spouse, Parent, Friend, etc.', helperText: '' }, required()),
        field('phone', 'Emergency Contact Phone', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('page-break', 'Page Break 2', { label: 'Medical History' }),

        // PAGE 3: Medical History
        field('heading', 'Medical History', { level: 2, content: 'Step 3: Medical History' }),
        field('textarea', 'Current Medications', { placeholder: 'List all medications you are currently taking...', rows: 3, helperText: '' }),
        field('textarea', 'Allergies', { placeholder: 'List any known allergies (medications, food, etc.)...', rows: 2, helperText: '' }),
        field('textarea', 'Past Medical Conditions', { placeholder: 'List any past surgeries, hospitalizations, or chronic conditions...', rows: 3, helperText: '' }),
        field('checkbox', 'Diabetes', { label: 'Diabetes' }),
        field('checkbox', 'Heart Disease', { label: 'Heart Disease' }),
        field('checkbox', 'High Blood Pressure', { label: 'High Blood Pressure' }),
        field('checkbox', 'Asthma', { label: 'Asthma' }),
        field('page-break', 'Page Break 3', { label: 'Insurance & Consent' }),

        // PAGE 4: Insurance & Consent
        field('heading', 'Insurance', { level: 2, content: 'Step 4: Insurance & Consent' }),
        field('textfield', 'Insurance Provider', { placeholder: 'Blue Cross, Aetna, etc.', helperText: '' }),
        field('textfield', 'Policy Number', { placeholder: 'Your policy/member ID', helperText: '' }),
        field('textfield', 'Group Number', { placeholder: 'Group number if applicable', helperText: '' }),
        field('file', 'Upload Insurance Card', { accept: '.pdf,.jpg,.png', multiple: false }),
        field('checkbox', 'HIPAA Consent', { label: 'I acknowledge receipt of the HIPAA Privacy Notice' }, required()),
        field('signature', 'Patient Signature', { helperText: 'Sign to confirm information is accurate' }),
      ],
      settings: { submitButtonText: 'Submit Form', successMessage: 'Intake form submitted. See you at your appointment!', layout: 'vertical', multiStep: true, theme: 'red' },
    }),
  },

  // ─────────────────────────────────────────────
  // 36. Multi-Page Loan Application
  // ─────────────────────────────────────────────
  {
    id: 'multipage-loan-application',
    label: 'Loan Application (Multi-Page)',
    description: 'Complete loan application with personal, employment, and financial information.',
    category: 'multipage',
    icon: '💰',
    color: 'from-green-600 to-emerald-600',
    fields: 21,
    buildSchema: () => ({
      title: 'Loan Application',
      description: 'Apply for a loan in 4 simple steps.',
      components: [
        // PAGE 1: Personal Information
        field('heading', 'Personal Info', { level: 2, content: 'Step 1: Personal Information' }),
        field('textfield', 'Full Legal Name', { placeholder: 'John Michael Doe', helperText: '' }, required()),
        field('date', 'Date of Birth', { helperText: 'Must be 18 or older' }, required()),
        field('textfield', 'Social Security Number', { placeholder: 'XXX-XX-XXXX', helperText: 'Required for credit check' }, required()),
        field('email', 'Email Address', { placeholder: 'you@example.com', helperText: '' }, required()),
        field('phone', 'Phone Number', { placeholder: '+1 (000) 000-0000', helperText: '' }, required()),
        field('textfield', 'Current Address', { placeholder: '123 Main St, City, State ZIP', helperText: '' }, required()),
        field('page-break', 'Page Break 1', { label: 'Employment Info' }),

        // PAGE 2: Employment Information
        field('heading', 'Employment', { level: 2, content: 'Step 2: Employment Information' }),
        field('select', 'Employment Status', {
          placeholder: 'Select status...',
          options: [
            { id: nanoid(), label: 'Employed Full-Time', value: 'fulltime' },
            { id: nanoid(), label: 'Employed Part-Time', value: 'parttime' },
            { id: nanoid(), label: 'Self-Employed', value: 'selfemployed' },
            { id: nanoid(), label: 'Retired', value: 'retired' },
            { id: nanoid(), label: 'Unemployed', value: 'unemployed' },
          ],
        }, required()),
        field('textfield', 'Employer Name', { placeholder: 'Company name', helperText: '' }),
        field('textfield', 'Job Title', { placeholder: 'Your position', helperText: '' }),
        field('number', 'Years at Current Job', { placeholder: '5', min: 0, helperText: '' }),
        field('number', 'Annual Income', { placeholder: '75000', min: 0, helperText: 'Gross annual income in USD' }, required()),
        field('page-break', 'Page Break 2', { label: 'Loan Details' }),

        // PAGE 3: Loan Details
        field('heading', 'Loan Details', { level: 2, content: 'Step 3: Loan Details' }),
        field('select', 'Loan Purpose', {
          placeholder: 'Select purpose...',
          options: [
            { id: nanoid(), label: 'Home Purchase', value: 'home' },
            { id: nanoid(), label: 'Auto Purchase', value: 'auto' },
            { id: nanoid(), label: 'Debt Consolidation', value: 'debt' },
            { id: nanoid(), label: 'Home Improvement', value: 'improvement' },
            { id: nanoid(), label: 'Personal', value: 'personal' },
            { id: nanoid(), label: 'Business', value: 'business' },
          ],
        }, required()),
        field('number', 'Loan Amount Requested', { placeholder: '25000', min: 1000, helperText: 'Amount in USD' }, required()),
        field('select', 'Preferred Term', {
          placeholder: 'Select loan term...',
          options: [
            { id: nanoid(), label: '12 months', value: '12' },
            { id: nanoid(), label: '24 months', value: '24' },
            { id: nanoid(), label: '36 months', value: '36' },
            { id: nanoid(), label: '48 months', value: '48' },
            { id: nanoid(), label: '60 months', value: '60' },
          ],
        }),
        field('page-break', 'Page Break 3', { label: 'Review & Submit' }),

        // PAGE 4: Review & Consent
        field('heading', 'Review', { level: 2, content: 'Step 4: Review & Submit' }),
        field('paragraph', 'ReviewText', { content: 'Please review your information before submitting. By submitting this application, you authorize us to perform a credit check.' }),
        field('checkbox', 'Credit Check', { label: 'I authorize a credit check to process this application' }, required()),
        field('checkbox', 'Terms', { label: 'I agree to the Terms and Conditions' }, required()),
        field('checkbox', 'E-Sign', { label: 'I consent to electronic signatures and communications' }, required()),
        field('signature', 'Applicant Signature', { helperText: 'Sign to submit your application' }),
      ],
      settings: { submitButtonText: 'Submit Application', successMessage: 'Application submitted! We will review and contact you within 2-3 business days.', layout: 'vertical', multiStep: true, theme: 'green' },
    }),
  },

  // ─────────────────────────────────────────────
  // 37. Multi-Page Survey
  // ─────────────────────────────────────────────
  {
    id: 'multipage-survey',
    label: 'Research Survey (Multi-Page)',
    description: 'Comprehensive research survey with demographics, opinions, and feedback sections.',
    category: 'multipage',
    icon: '📝',
    color: 'from-violet-600 to-purple-600',
    fields: 18,
    buildSchema: () => ({
      title: 'Research Survey',
      description: 'Help us understand your needs and preferences.',
      components: [
        // PAGE 1: Demographics
        field('heading', 'Demographics', { level: 2, content: 'Part 1: Demographics' }),
        field('paragraph', 'DemoIntro', { content: 'This information helps us analyze responses across different groups.' }),
        field('select', 'Age Group', {
          placeholder: 'Select your age group...',
          options: [
            { id: nanoid(), label: '18-24', value: '18-24' },
            { id: nanoid(), label: '25-34', value: '25-34' },
            { id: nanoid(), label: '35-44', value: '35-44' },
            { id: nanoid(), label: '45-54', value: '45-54' },
            { id: nanoid(), label: '55-64', value: '55-64' },
            { id: nanoid(), label: '65+', value: '65+' },
          ],
        }, required()),
        field('select', 'Education Level', {
          placeholder: 'Select education level...',
          options: [
            { id: nanoid(), label: 'High School', value: 'highschool' },
            { id: nanoid(), label: 'Some College', value: 'somecollege' },
            { id: nanoid(), label: "Bachelor's Degree", value: 'bachelors' },
            { id: nanoid(), label: 'Graduate Degree', value: 'graduate' },
          ],
        }),
        field('select', 'Employment Status', {
          placeholder: 'Select status...',
          options: [
            { id: nanoid(), label: 'Employed', value: 'employed' },
            { id: nanoid(), label: 'Self-Employed', value: 'selfemployed' },
            { id: nanoid(), label: 'Student', value: 'student' },
            { id: nanoid(), label: 'Retired', value: 'retired' },
            { id: nanoid(), label: 'Other', value: 'other' },
          ],
        }),
        field('page-break', 'Page Break 1', { label: 'Your Experience' }),

        // PAGE 2: Experience & Usage
        field('heading', 'Experience', { level: 2, content: 'Part 2: Your Experience' }),
        field('select', 'How long have you used our product?', {
          placeholder: 'Select duration...',
          options: [
            { id: nanoid(), label: 'Less than 1 month', value: 'less1m' },
            { id: nanoid(), label: '1-6 months', value: '1-6m' },
            { id: nanoid(), label: '6-12 months', value: '6-12m' },
            { id: nanoid(), label: '1-2 years', value: '1-2y' },
            { id: nanoid(), label: 'More than 2 years', value: 'more2y' },
          ],
        }, required()),
        field('select', 'How often do you use it?', {
          placeholder: 'Select frequency...',
          options: [
            { id: nanoid(), label: 'Daily', value: 'daily' },
            { id: nanoid(), label: 'Weekly', value: 'weekly' },
            { id: nanoid(), label: 'Monthly', value: 'monthly' },
            { id: nanoid(), label: 'Rarely', value: 'rarely' },
          ],
        }, required()),
        field('rating', 'Overall Satisfaction', { maxRating: 5, helperText: '1 = Very Dissatisfied, 5 = Very Satisfied' }, required()),
        field('rating', 'Ease of Use', { maxRating: 5, helperText: '' }),
        field('rating', 'Value for Money', { maxRating: 5, helperText: '' }),
        field('page-break', 'Page Break 2', { label: 'Feedback' }),

        // PAGE 3: Open Feedback
        field('heading', 'Feedback', { level: 2, content: 'Part 3: Your Feedback' }),
        field('textarea', 'What do you like most?', { placeholder: 'Tell us what you love about our product...', rows: 3, helperText: '' }),
        field('textarea', 'What could be improved?', { placeholder: 'Share your suggestions for improvement...', rows: 3, helperText: '' }),
        field('select', 'Would you recommend us?', {
          placeholder: 'Select...',
          options: [
            { id: nanoid(), label: 'Definitely Yes', value: 'definitely' },
            { id: nanoid(), label: 'Probably Yes', value: 'probably' },
            { id: nanoid(), label: 'Not Sure', value: 'unsure' },
            { id: nanoid(), label: 'Probably No', value: 'probablynot' },
            { id: nanoid(), label: 'Definitely No', value: 'definitelynot' },
          ],
        }, required()),
        field('email', 'Email (Optional)', { placeholder: 'you@example.com', helperText: 'Leave your email if you would like us to follow up' }),
      ],
      settings: { submitButtonText: 'Submit Survey', successMessage: 'Thank you for your feedback! Your responses have been recorded.', layout: 'vertical', multiStep: true, theme: 'violet' },
    }),
  },
];

export const TEMPLATE_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all',          label: 'All Templates' },
  { id: 'multipage',    label: '📄 Multi-Page Forms' },
  { id: 'business',     label: 'Business'      },
  { id: 'registration', label: 'Registration'  },
  { id: 'feedback',     label: 'Feedback'      },
  { id: 'ecommerce',    label: 'E-Commerce'    },
  { id: 'education',    label: 'Education'     },
  { id: 'nonprofit',    label: 'Nonprofit'     },
  { id: 'legal',        label: 'Legal'         },
  { id: 'personal',     label: 'Personal'      },
  { id: 'fitness',      label: 'Fitness & Wellness' },
  { id: 'restaurant',   label: 'Restaurant & Food'  },
  { id: 'realestate',   label: 'Real Estate'        },
  { id: 'travel',       label: 'Travel'             },
  { id: 'creative',     label: 'Creative'           },
  { id: 'pet',          label: 'Pet Services'       },
  { id: 'medical',      label: 'Medical'            },
  { id: 'survey',       label: 'Survey'             },
];
