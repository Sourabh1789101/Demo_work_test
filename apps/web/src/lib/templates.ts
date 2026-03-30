import { nanoid } from 'nanoid';
import { FormSchema, FormComponent } from '../../modules/Core/types';

export interface FormTemplate {
  id: string;
  label: string;
  description: string;
  category: 'business' | 'personal' | 'feedback' | 'registration' | 'ecommerce' | 'education' | 'legal' | 'nonprofit';
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
];

export const TEMPLATE_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all',          label: 'All Templates' },
  { id: 'business',     label: 'Business'      },
  { id: 'registration', label: 'Registration'  },
  { id: 'feedback',     label: 'Feedback'      },
  { id: 'ecommerce',    label: 'E-Commerce'    },
  { id: 'education',    label: 'Education'     },
  { id: 'nonprofit',    label: 'Nonprofit'     },
  { id: 'legal',        label: 'Legal'         },
  { id: 'personal',     label: 'Personal'      },
];
