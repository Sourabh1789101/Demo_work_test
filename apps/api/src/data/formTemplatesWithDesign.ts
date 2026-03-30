import type { TemplateCategory } from '../types/templateCatalog.js';

export const TEMPLATE_CATALOG_SEED: TemplateCategory[] = [
	// ─────────────────────────────────────────────────────────
	// 1. JOB APPLICATION FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'job-application-forms',
		category_name: 'Job Application Forms',
		description: 'Professional templates for hiring and recruitment workflows.',
		templates: [
			{
				id: 'tpl_job_001',
				name: 'Software Developer Application',
				description: 'A professional form for tech recruits with portfolio and experience fields.',
				design_settings: {
					theme: 'Modern Professional',
					primary_color: '#2C3E50',
					secondary_color: '#ECF0F1',
					font_family: 'Roboto, sans-serif',
					layout: 'Single Column',
					background_type: 'Solid Color',
				},
				fields: [
					{ type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
					{ type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
					{ type: 'tel', label: 'Phone Number', placeholder: '+1 (000) 000-0000', required: true },
					{ type: 'file_upload', label: 'Upload Resume (PDF)', required: true },
					{ type: 'url', label: 'Portfolio / GitHub Link', required: false },
					{
						type: 'dropdown',
						label: 'Experience Level',
						options: ['Junior (0-2 yrs)', 'Mid (3-5 yrs)', 'Senior (5+ yrs)', 'Lead / Principal'],
						required: true,
					},
					{
						type: 'checkbox_group',
						label: 'Tech Stack',
						options: ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Go', 'Rust'],
					},
					{ type: 'long_text', label: 'Why do you want to join us?', required: true },
					{ type: 'date', label: 'Earliest Start Date', required: false },
				],
			},
			{
				id: 'tpl_job_002',
				name: 'Retail Staff Application',
				description: 'A simple, mobile-friendly form for retail and customer-facing positions.',
				design_settings: {
					theme: 'Clean Minimalist',
					primary_color: '#3498DB',
					secondary_color: '#FFFFFF',
					font_family: 'Arial, sans-serif',
					layout: 'Card Layout',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'First Name', required: true },
					{ type: 'text', label: 'Last Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{ type: 'availability', label: 'Available Shifts', options: ['Morning', 'Afternoon', 'Evening', 'Night', 'Weekends'], required: true },
					{ type: 'date', label: 'Earliest Start Date', required: true },
					{ type: 'long_text', label: 'Previous Work Experience', placeholder: 'Briefly describe your relevant experience', required: false },
				],
			},
			{
				id: 'tpl_job_003',
				name: 'Marketing Specialist Application',
				description: 'Targeted form for marketing roles with campaign and strategy experience.',
				design_settings: {
					theme: 'Creative Vibrant',
					primary_color: '#E74C3C',
					secondary_color: '#FDEDEC',
					font_family: 'Montserrat, sans-serif',
					layout: 'Two Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'url', label: 'LinkedIn Profile', required: false },
					{
						type: 'dropdown',
						label: 'Marketing Specialisation',
						options: ['Content Marketing', 'SEO / SEM', 'Social Media', 'Email Marketing', 'Paid Ads', 'Brand Strategy'],
						required: true,
					},
					{ type: 'number', label: 'Years of Experience', required: true },
					{ type: 'long_text', label: 'Describe a successful campaign you led', required: true },
					{ type: 'file_upload', label: 'Upload Portfolio / CV', required: true },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 2. EVENT REGISTRATION FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'event-registration-forms',
		category_name: 'Event Registration Forms',
		description: 'Collect attendee information for conferences, parties, and workshops.',
		templates: [
			{
				id: 'tpl_evt_001',
				name: 'Corporate Conference Signup',
				description: 'Elegant design for business conferences with ticket selection.',
				design_settings: {
					theme: 'Corporate Elegant',
					primary_color: '#1ABC9C',
					secondary_color: '#E8F8F5',
					font_family: 'Helvetica, sans-serif',
					layout: 'Two Column',
					background_image: 'https://placehold.co/1920x1080/1abc9c/ffffff?text=Conference',
				},
				fields: [
					{ type: 'text', label: 'Company Name', required: true },
					{ type: 'text', label: 'Attendee Name', required: true },
					{ type: 'email', label: 'Work Email', required: true },
					{ type: 'tel', label: 'Phone Number', required: false },
					{ type: 'dropdown', label: 'Ticket Type', options: ['Standard', 'VIP', 'Group Pass (5+)', 'Student'], required: true },
					{ type: 'dropdown', label: 'Industry', options: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Other'], required: false },
					{ type: 'payment', label: 'Registration Fee', price: '$250.00' },
				],
			},
			{
				id: 'tpl_evt_002',
				name: 'Birthday Party RSVP',
				description: 'Fun and colorful RSVP for personal celebrations and parties.',
				design_settings: {
					theme: 'Fun Festive',
					primary_color: '#E74C3C',
					secondary_color: '#FDEDEC',
					font_family: 'Comic Sans MS, cursive',
					layout: 'Single Column',
					background_type: 'Confetti Pattern',
				},
				fields: [
					{ type: 'text', label: 'Your Name', required: true },
					{ type: 'radio', label: 'Will you attend?', options: ['Yes, excited!', "Sorry, can't make it", 'Maybe, I\'ll confirm later'], required: true },
					{ type: 'number', label: 'Number of Guests', required: false },
					{ type: 'dropdown', label: 'Dietary Preference', options: ['No Preference', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'], required: false },
					{ type: 'long_text', label: 'Message for the Birthday Person', required: false },
				],
			},
			{
				id: 'tpl_evt_003',
				name: 'Workshop / Webinar Registration',
				description: 'Capture registrations for online or in-person workshops and webinars.',
				design_settings: {
					theme: 'Education Blue',
					primary_color: '#2980B9',
					secondary_color: '#EBF5FB',
					font_family: 'Open Sans, sans-serif',
					layout: 'Single Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', placeholder: 'Confirmation will be sent here', required: true },
					{ type: 'text', label: 'Job Title / Role', required: false },
					{ type: 'dropdown', label: 'Session', options: ['Morning Session (9am–12pm)', 'Afternoon Session (2pm–5pm)', 'Full Day'], required: true },
					{ type: 'radio', label: 'Format', options: ['In-Person', 'Online (Virtual)', 'Either'], required: true },
					{ type: 'long_text', label: 'What do you hope to learn?', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 3. FEEDBACK FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'feedback-forms',
		category_name: 'Feedback Forms',
		description: 'Gather ratings, reviews, and improvement insights from customers.',
		templates: [
			{
				id: 'tpl_fdb_001',
				name: 'Product Review Form',
				description: 'Focused on star ratings and detailed product experience.',
				design_settings: {
					theme: 'Minimalist UI',
					primary_color: '#F1C40F',
					secondary_color: '#FEFEFE',
					font_family: 'Lato, sans-serif',
					layout: 'Card Layout',
					background_type: 'White',
				},
				fields: [
					{ type: 'rating', label: 'Overall Satisfaction', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Product Quality', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Value for Money', scale: '5 Stars', required: true },
					{ type: 'text', label: 'Product Name / Model', required: true },
					{ type: 'long_text', label: 'What did you like or dislike?', required: true },
					{ type: 'radio', label: 'Would you buy again?', options: ['Yes', 'No', 'Maybe'], required: false },
					{ type: 'file_upload', label: 'Upload Product Photo (Optional)', required: false },
				],
			},
			{
				id: 'tpl_fdb_002',
				name: 'Service Quality Survey',
				description: 'Measure customer satisfaction across key service touchpoints.',
				design_settings: {
					theme: 'Corporate Clean',
					primary_color: '#27AE60',
					secondary_color: '#EAFAF1',
					font_family: 'Roboto, sans-serif',
					layout: 'Single Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Your Name', required: false },
					{ type: 'email', label: 'Email Address', required: false },
					{ type: 'dropdown', label: 'Service Used', options: ['Customer Support', 'Installation', 'Maintenance', 'Consulting', 'Delivery'], required: true },
					{ type: 'rating', label: 'Speed of Service', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Friendliness of Staff', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Problem Resolution', scale: '5 Stars', required: true },
					{ type: 'radio', label: 'Would you recommend us?', options: ['Definitely', 'Probably', 'Not Sure', 'No'], required: true },
					{ type: 'long_text', label: 'Additional Comments', required: false },
				],
			},
			{
				id: 'tpl_fdb_003',
				name: 'Employee Satisfaction Survey',
				description: 'Anonymous internal survey to gauge team morale and engagement.',
				design_settings: {
					theme: 'Professional Blue',
					primary_color: '#2980B9',
					secondary_color: '#EBF5FB',
					font_family: 'Arial, sans-serif',
					layout: 'Single Column',
					background_type: 'Solid Color',
				},
				fields: [
					{ type: 'dropdown', label: 'Department', options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'], required: true },
					{ type: 'rating', label: 'Overall Job Satisfaction', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Work-Life Balance', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Management Support', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Career Growth Opportunities', scale: '5 Stars', required: true },
					{ type: 'radio', label: 'Do you see yourself here in 2 years?', options: ['Yes', 'No', 'Unsure'], required: true },
					{ type: 'long_text', label: 'What could we improve?', required: false },
					{ type: 'long_text', label: 'What do you appreciate most?', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 4. MEDICAL FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'medical-forms',
		category_name: 'Medical Forms',
		description: 'Secure patient intake, consent, and health screening forms.',
		templates: [
			{
				id: 'tpl_med_001',
				name: 'Patient Intake Form',
				description: 'Soothing colors with a HIPAA-friendly layout for new patient intake.',
				design_settings: {
					theme: 'Medical Clinical',
					primary_color: '#3498DB',
					secondary_color: '#EBF5FB',
					font_family: 'Open Sans, sans-serif',
					layout: 'Single Column (Large Inputs)',
					background_type: 'Light Blue Tint',
				},
				fields: [
					{ type: 'text', label: 'Patient Full Name', required: true },
					{ type: 'date', label: 'Date of Birth', required: true },
					{ type: 'radio', label: 'Gender', options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'], required: false },
					{ type: 'tel', label: 'Contact Number', required: true },
					{ type: 'email', label: 'Email Address', required: false },
					{ type: 'text', label: 'Emergency Contact Name', required: true },
					{ type: 'tel', label: 'Emergency Contact Phone', required: true },
					{ type: 'text', label: 'Insurance Provider', required: false },
					{ type: 'text', label: 'Insurance Policy Number', required: false },
					{ type: 'checkbox_group', label: 'Current Medications', options: ['None', 'Aspirin', 'Ibuprofen', 'Metformin', 'Blood Pressure Meds', 'Other'] },
					{ type: 'checkbox_group', label: 'Known Allergies', options: ['None', 'Penicillin', 'Aspirin', 'Latex', 'Nuts', 'Other'] },
					{ type: 'long_text', label: 'Reason for Visit', required: true },
					{ type: 'signature', label: 'Patient Digital Signature', required: true },
				],
			},
			{
				id: 'tpl_med_002',
				name: 'Health Screening Questionnaire',
				description: 'Pre-appointment health screening to identify risk factors.',
				design_settings: {
					theme: 'Health Green',
					primary_color: '#27AE60',
					secondary_color: '#EAFAF1',
					font_family: 'Open Sans, sans-serif',
					layout: 'Single Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'date', label: 'Date of Birth', required: true },
					{ type: 'number', label: 'Height (cm)', required: false },
					{ type: 'number', label: 'Weight (kg)', required: false },
					{ type: 'radio', label: 'Do you smoke?', options: ['Yes', 'No', 'Former Smoker'], required: true },
					{ type: 'radio', label: 'Do you exercise regularly?', options: ['Daily', 'A few times a week', 'Rarely', 'Never'], required: true },
					{ type: 'checkbox_group', label: 'Pre-existing Conditions', options: ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Arthritis', 'None'] },
					{ type: 'long_text', label: 'Any additional health concerns?', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 5. CONTACT FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'contact-forms',
		category_name: 'Contact Forms',
		description: 'Simple and professional forms to capture leads and enquiries.',
		templates: [
			{
				id: 'tpl_con_001',
				name: 'General Contact Form',
				description: 'Clean, minimal contact form suitable for any website.',
				design_settings: {
					theme: 'Clean Blue',
					primary_color: '#2563EB',
					secondary_color: '#EFF6FF',
					font_family: 'Inter, sans-serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Full Name', placeholder: 'Your name', required: true },
					{ type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
					{ type: 'tel', label: 'Phone Number', placeholder: '+1 (000) 000-0000', required: false },
					{
						type: 'dropdown',
						label: 'Subject',
						options: ['General Enquiry', 'Technical Support', 'Sales', 'Billing', 'Partnership', 'Other'],
						required: true,
					},
					{ type: 'long_text', label: 'Message', placeholder: 'How can we help you?', required: true },
				],
			},
			{
				id: 'tpl_con_002',
				name: 'Business Enquiry Form',
				description: 'Lead generation form capturing company and project details.',
				design_settings: {
					theme: 'Business Dark',
					primary_color: '#1E293B',
					secondary_color: '#F8FAFC',
					font_family: 'Roboto, sans-serif',
					layout: 'Two Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'First Name', required: true },
					{ type: 'text', label: 'Last Name', required: true },
					{ type: 'email', label: 'Work Email', required: true },
					{ type: 'text', label: 'Company Name', required: true },
					{ type: 'text', label: 'Job Title', required: false },
					{ type: 'dropdown', label: 'Company Size', options: ['1–10', '11–50', '51–200', '201–500', '500+'], required: false },
					{ type: 'dropdown', label: 'Budget Range', options: ['< $5K', '$5K–$20K', '$20K–$100K', '$100K+', 'Not Sure'], required: false },
					{ type: 'long_text', label: 'Project Description', placeholder: 'Tell us about your project or requirements', required: true },
				],
			},
			{
				id: 'tpl_con_003',
				name: 'Support Ticket Form',
				description: 'Help desk support request form with priority and issue type.',
				design_settings: {
					theme: 'Support Orange',
					primary_color: '#F97316',
					secondary_color: '#FFF7ED',
					font_family: 'Inter, sans-serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{
						type: 'dropdown',
						label: 'Issue Category',
						options: ['Account Access', 'Billing', 'Technical Bug', 'Feature Request', 'Performance', 'Other'],
						required: true,
					},
					{ type: 'radio', label: 'Priority', options: ['Low', 'Medium', 'High', 'Critical'], required: true },
					{ type: 'text', label: 'Subject', placeholder: 'Brief summary of the issue', required: true },
					{ type: 'long_text', label: 'Description', placeholder: 'Please provide as much detail as possible', required: true },
					{ type: 'file_upload', label: 'Attach Screenshot / File', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 6. EDUCATION FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'education-forms',
		category_name: 'Education Forms',
		description: 'Enrollment, course registration, and student assessment forms.',
		templates: [
			{
				id: 'tpl_edu_001',
				name: 'Course Enrollment Form',
				description: 'Register students for classes with course and payment details.',
				design_settings: {
					theme: 'Academic Blue',
					primary_color: '#1D4ED8',
					secondary_color: '#EFF6FF',
					font_family: 'Georgia, serif',
					layout: 'Single Column',
					background_type: 'Light Blue Tint',
				},
				fields: [
					{ type: 'text', label: "Student's Full Name", required: true },
					{ type: 'date', label: 'Date of Birth', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{ type: 'text', label: "Parent / Guardian Name", required: false },
					{
						type: 'dropdown',
						label: 'Course',
						options: ['Introduction to Programming', 'Data Science Fundamentals', 'Web Development Bootcamp', 'Digital Marketing', 'Business Analytics'],
						required: true,
					},
					{ type: 'dropdown', label: 'Schedule', options: ['Weekday Morning', 'Weekday Evening', 'Weekend'], required: true },
					{ type: 'radio', label: 'Learning Mode', options: ['In-Person', 'Online', 'Hybrid'], required: true },
					{ type: 'payment', label: 'Enrollment Fee', price: '$499.00' },
					{ type: 'signature', label: 'Student / Guardian Signature', required: true },
				],
			},
			{
				id: 'tpl_edu_002',
				name: 'Student Feedback Form',
				description: 'Collect students\' opinions on course quality and instructor effectiveness.',
				design_settings: {
					theme: 'Campus Green',
					primary_color: '#15803D',
					secondary_color: '#F0FDF4',
					font_family: 'Open Sans, sans-serif',
					layout: 'Card Layout',
					background_type: 'White',
				},
				fields: [
					{ type: 'dropdown', label: 'Course Name', options: ['Math 101', 'English Literature', 'Physics 201', 'History 101', 'Computer Science'], required: true },
					{ type: 'text', label: 'Instructor Name', required: false },
					{ type: 'rating', label: 'Course Content Quality', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Instructor Effectiveness', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Overall Experience', scale: '5 Stars', required: true },
					{ type: 'radio', label: 'Would you recommend this course?', options: ['Definitely', 'Probably', 'Not sure', 'No'], required: true },
					{ type: 'long_text', label: 'What could be improved?', required: false },
					{ type: 'long_text', label: 'Best part of the course?', required: false },
				],
			},
			{
				id: 'tpl_edu_003',
				name: 'School Admission Application',
				description: 'Comprehensive new student admission form for schools and colleges.',
				design_settings: {
					theme: 'Formal Classic',
					primary_color: '#7C3AED',
					secondary_color: '#F5F3FF',
					font_family: 'Times New Roman, serif',
					layout: 'Two Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: "Applicant's Full Name", required: true },
					{ type: 'date', label: 'Date of Birth', required: true },
					{ type: 'radio', label: 'Gender', options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'], required: false },
					{ type: 'text', label: "Parent / Guardian Full Name", required: true },
					{ type: 'email', label: 'Parent / Guardian Email', required: true },
					{ type: 'tel', label: 'Parent / Guardian Phone', required: true },
					{ type: 'text', label: 'Previous School / Institution', required: false },
					{ type: 'dropdown', label: 'Grade / Year Applying For', options: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'], required: true },
					{ type: 'file_upload', label: 'Upload Previous Report Card', required: false },
					{ type: 'long_text', label: 'Why do you wish to join our institution?', required: false },
					{ type: 'signature', label: 'Guardian Signature', required: true },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 7. E-COMMERCE & ORDER FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'ecommerce-order-forms',
		category_name: 'E-Commerce & Order Forms',
		description: 'Product ordering, pre-order, and custom request forms.',
		templates: [
			{
				id: 'tpl_eco_001',
				name: 'Product Order Form',
				description: 'Simple product order form with product selection and shipping details.',
				design_settings: {
					theme: 'Commerce Coral',
					primary_color: '#E11D48',
					secondary_color: '#FFF1F2',
					font_family: 'Inter, sans-serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Customer Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{
						type: 'dropdown',
						label: 'Product',
						options: ['Classic T-Shirt — $25', 'Premium Hoodie — $59', 'Canvas Tote Bag — $15', 'Water Bottle — $20', 'Custom Mug — $12'],
						required: true,
					},
					{ type: 'dropdown', label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A'], required: false },
					{ type: 'number', label: 'Quantity', required: true },
					{ type: 'long_text', label: 'Shipping Address', placeholder: 'Street, City, State, ZIP, Country', required: true },
					{ type: 'long_text', label: 'Special Instructions', required: false },
				],
			},
			{
				id: 'tpl_eco_002',
				name: 'Custom Design Request',
				description: 'Form for customers to submit custom print or design orders.',
				design_settings: {
					theme: 'Creative Studio',
					primary_color: '#7C3AED',
					secondary_color: '#F5F3FF',
					font_family: 'Poppins, sans-serif',
					layout: 'Card Layout',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Your Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{
						type: 'dropdown',
						label: 'Product Type',
						options: ['T-Shirt', 'Mug', 'Phone Case', 'Canvas Print', 'Sticker', 'Tote Bag'],
						required: true,
					},
					{ type: 'number', label: 'Quantity', required: true },
					{ type: 'long_text', label: 'Design Description', placeholder: 'Describe your design idea in detail', required: true },
					{ type: 'file_upload', label: 'Upload Design File / Reference Image', required: false },
					{ type: 'date', label: 'Required By Date', required: false },
					{ type: 'radio', label: 'Rush Order?', options: ['Yes (+$20)', 'No'], required: true },
				],
			},
			{
				id: 'tpl_eco_003',
				name: 'Pre-Order Form',
				description: 'Capture pre-orders for upcoming products with deposit payment.',
				design_settings: {
					theme: 'Launch Dark',
					primary_color: '#0F172A',
					secondary_color: '#F1F5F9',
					font_family: 'Space Grotesk, sans-serif',
					layout: 'Single Column',
					background_type: 'Solid Color',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: false },
					{
						type: 'dropdown',
						label: 'Product Edition',
						options: ['Standard Edition — $99', 'Deluxe Edition — $149', 'Collector\'s Edition — $249'],
						required: true,
					},
					{ type: 'number', label: 'Quantity', required: true },
					{ type: 'radio', label: 'Deposit Option', options: ['Pay 50% deposit now', 'Pay full amount now'], required: true },
					{ type: 'long_text', label: 'Delivery Address', required: true },
					{ type: 'signature', label: 'Pre-order Agreement Signature', required: true },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 8. SURVEY FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'survey-forms',
		category_name: 'Survey Forms',
		description: 'Market research, opinion polls, and data collection surveys.',
		templates: [
			{
				id: 'tpl_sur_001',
				name: 'Market Research Survey',
				description: 'Gather consumer insights with demographic and preference questions.',
				design_settings: {
					theme: 'Research Neutral',
					primary_color: '#475569',
					secondary_color: '#F8FAFC',
					font_family: 'Roboto, sans-serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'dropdown', label: 'Age Range', options: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'], required: true },
					{ type: 'radio', label: 'Gender', options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'], required: false },
					{ type: 'dropdown', label: 'Household Income', options: ['Under $25K', '$25K–$50K', '$50K–$75K', '$75K–$100K', '$100K+', 'Prefer not to say'], required: false },
					{
						type: 'checkbox_group',
						label: 'How do you hear about new products?',
						options: ['Social Media', 'Online Ads', 'Word of Mouth', 'TV / Radio', 'Email Newsletter', 'Search Engine'],
					},
					{ type: 'radio', label: 'How often do you shop online?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], required: true },
					{ type: 'rating', label: 'How important is sustainability when buying?', scale: '5 Stars', required: true },
					{ type: 'long_text', label: 'What factors most influence your purchase decisions?', required: false },
				],
			},
			{
				id: 'tpl_sur_002',
				name: 'Post-Purchase Survey',
				description: 'Follow up with customers after a sale to measure satisfaction.',
				design_settings: {
					theme: 'Warm Satisfaction',
					primary_color: '#D97706',
					secondary_color: '#FFFBEB',
					font_family: 'Nunito, sans-serif',
					layout: 'Card Layout',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Order Number', required: false },
					{ type: 'rating', label: 'Overall Purchase Experience', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Delivery Speed', scale: '5 Stars', required: true },
					{ type: 'rating', label: 'Product Quality', scale: '5 Stars', required: true },
					{ type: 'radio', label: 'Was the product as described?', options: ['Yes, exactly', 'Mostly yes', 'Not really', 'No'], required: true },
					{ type: 'radio', label: 'Would you shop with us again?', options: ['Definitely', 'Probably', 'Unlikely', 'No'], required: true },
					{ type: 'long_text', label: 'Any other comments?', required: false },
				],
			},
			{
				id: 'tpl_sur_003',
				name: 'Community Needs Assessment',
				description: 'Identify community priorities and collect resident feedback.',
				design_settings: {
					theme: 'Community Purple',
					primary_color: '#6D28D9',
					secondary_color: '#F5F3FF',
					font_family: 'Open Sans, sans-serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Neighbourhood / Area', required: false },
					{
						type: 'checkbox_group',
						label: 'Top priorities for our community',
						options: ['Road Infrastructure', 'Public Safety', 'Parks & Recreation', 'Affordable Housing', 'Public Transport', 'Healthcare Access', 'Education'],
					},
					{ type: 'rating', label: 'Quality of local services overall', scale: '5 Stars', required: true },
					{ type: 'radio', label: 'How engaged are you in local events?', options: ['Very Active', 'Sometimes', 'Rarely', 'Never'], required: false },
					{ type: 'long_text', label: 'What is the biggest challenge facing our community?', required: false },
					{ type: 'long_text', label: 'Any suggestions for improvement?', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 9. APPOINTMENT & BOOKING FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'appointment-booking-forms',
		category_name: 'Appointment & Booking Forms',
		description: 'Schedule consultations, services, and appointments online.',
		templates: [
			{
				id: 'tpl_apt_001',
				name: 'General Appointment Booking',
				description: 'Book any type of appointment with service and time slot selection.',
				design_settings: {
					theme: 'Calm Teal',
					primary_color: '#0D9488',
					secondary_color: '#F0FDFA',
					font_family: 'Inter, sans-serif',
					layout: 'Single Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{
						type: 'dropdown',
						label: 'Service',
						options: ['General Consultation', 'Follow-Up Visit', 'Specialist Referral', 'Lab Tests', 'Dental Checkup', 'Eye Exam'],
						required: true,
					},
					{ type: 'date', label: 'Preferred Date', required: true },
					{
						type: 'dropdown',
						label: 'Preferred Time Slot',
						options: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
						required: true,
					},
					{ type: 'radio', label: 'Appointment Type', options: ['In-Person', 'Video Call', 'Phone Call'], required: true },
					{ type: 'long_text', label: 'Reason for Visit / Notes', required: false },
				],
			},
			{
				id: 'tpl_apt_002',
				name: 'Beauty & Salon Booking',
				description: 'Book hair, beauty, or spa appointments with service selection.',
				design_settings: {
					theme: 'Beauty Blush',
					primary_color: '#DB2777',
					secondary_color: '#FDF2F8',
					font_family: 'Playfair Display, serif',
					layout: 'Card Layout',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Your Name', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{ type: 'email', label: 'Email Address', required: false },
					{
						type: 'dropdown',
						label: 'Service',
						options: ['Haircut & Style', 'Colour & Highlights', 'Blow-Dry', 'Manicure', 'Pedicure', 'Facial', 'Massage', 'Full Package'],
						required: true,
					},
					{ type: 'date', label: 'Appointment Date', required: true },
					{ type: 'dropdown', label: 'Time Preference', options: ['Morning (9am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–7pm)'], required: true },
					{ type: 'text', label: 'Preferred Stylist / Therapist (if any)', required: false },
					{ type: 'long_text', label: 'Special Requests or Notes', required: false },
				],
			},
			{
				id: 'tpl_apt_003',
				name: 'Real Estate Viewing Request',
				description: 'Schedule property viewings with buyer preferences and contact info.',
				design_settings: {
					theme: 'Property Slate',
					primary_color: '#334155',
					secondary_color: '#F8FAFC',
					font_family: 'Roboto, sans-serif',
					layout: 'Two Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{ type: 'text', label: 'Property Address / Listing ID', required: true },
					{ type: 'date', label: 'Preferred Viewing Date', required: true },
					{ type: 'dropdown', label: 'Preferred Time', options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'], required: true },
					{ type: 'radio', label: 'Are you pre-approved for financing?', options: ['Yes', 'No', 'In Progress'], required: false },
					{ type: 'dropdown', label: 'Buyer Type', options: ['First-Time Buyer', 'Investor', 'Upgrading', 'Downsizing', 'Renting'], required: false },
					{ type: 'long_text', label: 'Questions or Comments', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 10. NEWSLETTER & SUBSCRIPTION FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'newsletter-subscription-forms',
		category_name: 'Newsletter & Subscription Forms',
		description: 'Grow your email list and capture subscriber preferences.',
		templates: [
			{
				id: 'tpl_nws_001',
				name: 'Newsletter Signup',
				description: 'Simple newsletter subscription form with topic preferences.',
				design_settings: {
					theme: 'Indigo Clean',
					primary_color: '#4F46E5',
					secondary_color: '#EEF2FF',
					font_family: 'Inter, sans-serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'First Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{
						type: 'checkbox_group',
						label: 'Topics You Are Interested In',
						options: ['Product Updates', 'Industry News', 'Tutorials & Tips', 'Case Studies', 'Promotions & Offers', 'Events'],
					},
					{ type: 'radio', label: 'Preferred Frequency', options: ['Daily', 'Weekly Digest', 'Monthly Roundup'], required: false },
				],
			},
			{
				id: 'tpl_nws_002',
				name: 'Membership Registration',
				description: 'Sign up new members with tier selection and preferences.',
				design_settings: {
					theme: 'Premium Gold',
					primary_color: '#92400E',
					secondary_color: '#FFFBEB',
					font_family: 'Playfair Display, serif',
					layout: 'Card Layout',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: false },
					{
						type: 'dropdown',
						label: 'Membership Tier',
						options: ['Basic (Free)', 'Standard ($9/mo)', 'Premium ($29/mo)', 'Enterprise ($99/mo)'],
						required: true,
					},
					{
						type: 'checkbox_group',
						label: 'Areas of Interest',
						options: ['Exclusive Content', 'Early Access', 'Member Discounts', 'Community Access', 'Events & Webinars'],
					},
					{ type: 'radio', label: 'Billing Cycle', options: ['Monthly', 'Annually (Save 20%)'], required: false },
					{ type: 'signature', label: 'Terms & Conditions Agreement', required: true },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 11. VOLUNTEER & DONATION FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'volunteer-donation-forms',
		category_name: 'Volunteer & Donation Forms',
		description: 'Recruit volunteers and collect donor information for nonprofits.',
		templates: [
			{
				id: 'tpl_vol_001',
				name: 'Volunteer Application',
				description: 'Recruit volunteers with availability, skills, and motivation fields.',
				design_settings: {
					theme: 'Charity Green',
					primary_color: '#16A34A',
					secondary_color: '#F0FDF4',
					font_family: 'Open Sans, sans-serif',
					layout: 'Single Column',
					background_type: 'Light Gradient',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{ type: 'date', label: 'Date of Birth', required: false },
					{
						type: 'checkbox_group',
						label: 'Areas You Can Help With',
						options: ['Event Management', 'Fundraising', 'Administration', 'Marketing & Social Media', 'IT & Tech Support', 'Teaching / Mentoring', 'Driving / Logistics'],
					},
					{
						type: 'availability',
						label: 'Availability',
						options: ['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Saturday', 'Sunday'],
					},
					{ type: 'number', label: 'Hours Available Per Week', required: false },
					{ type: 'long_text', label: 'Why do you want to volunteer with us?', required: true },
					{ type: 'long_text', label: 'Relevant Skills or Experience', required: false },
				],
			},
			{
				id: 'tpl_vol_002',
				name: 'Donation Form',
				description: 'Collect donor information and preferred donation amounts.',
				design_settings: {
					theme: 'Hope Orange',
					primary_color: '#EA580C',
					secondary_color: '#FFF7ED',
					font_family: 'Inter, sans-serif',
					layout: 'Card Layout',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Donor Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: false },
					{
						type: 'dropdown',
						label: 'Donation Amount',
						options: ['$10', '$25', '$50', '$100', '$250', '$500', 'Custom Amount'],
						required: true,
					},
					{ type: 'radio', label: 'Donation Type', options: ['One-Time', 'Monthly Recurring', 'Annual'], required: true },
					{ type: 'dropdown', label: 'Donate To', options: ['General Fund', 'Education Programs', 'Emergency Relief', 'Community Development', 'Where Needed Most'], required: false },
					{ type: 'radio', label: 'Would you like to remain anonymous?', options: ['Yes', 'No'], required: false },
					{ type: 'long_text', label: 'Message (Optional)', required: false },
				],
			},
		],
	},

	// ─────────────────────────────────────────────────────────
	// 12. LEGAL & COMPLIANCE FORMS
	// ─────────────────────────────────────────────────────────
	{
		category_slug: 'legal-compliance-forms',
		category_name: 'Legal & Compliance Forms',
		description: 'Consent forms, waivers, and compliance documentation.',
		templates: [
			{
				id: 'tpl_leg_001',
				name: 'Liability Waiver Form',
				description: 'Activity waiver with risk acknowledgement and digital signature.',
				design_settings: {
					theme: 'Legal Formal',
					primary_color: '#1E293B',
					secondary_color: '#F8FAFC',
					font_family: 'Times New Roman, serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Participant Full Name', required: true },
					{ type: 'date', label: 'Date of Birth', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'tel', label: 'Phone Number', required: true },
					{ type: 'text', label: 'Activity / Event Name', required: true },
					{ type: 'date', label: 'Activity Date', required: true },
					{ type: 'text', label: 'Emergency Contact Name', required: true },
					{ type: 'tel', label: 'Emergency Contact Phone', required: true },
					{ type: 'radio', label: 'Do you have any medical conditions we should know about?', options: ['Yes', 'No'], required: true },
					{ type: 'long_text', label: 'If yes, please describe', required: false },
					{ type: 'radio', label: 'I have read and agree to the liability waiver terms', options: ['I Agree'], required: true },
					{ type: 'signature', label: 'Participant Signature', required: true },
					{ type: 'date', label: 'Signature Date', required: true },
				],
			},
			{
				id: 'tpl_leg_002',
				name: 'Photo / Video Consent Form',
				description: 'Obtain permission for photography and video recording at events.',
				design_settings: {
					theme: 'Clean Slate',
					primary_color: '#0F766E',
					secondary_color: '#F0FDFA',
					font_family: 'Georgia, serif',
					layout: 'Single Column',
					background_type: 'White',
				},
				fields: [
					{ type: 'text', label: 'Full Name', required: true },
					{ type: 'email', label: 'Email Address', required: true },
					{ type: 'text', label: 'Event / Organisation Name', required: true },
					{
						type: 'checkbox_group',
						label: 'I consent to the use of my image / likeness for',
						options: ['Internal Communications', 'Social Media Posts', 'Marketing Materials', 'Press Releases', 'Website Content'],
					},
					{ type: 'radio', label: 'Consent covers', options: ['Photography only', 'Video only', 'Both Photography and Video'], required: true },
					{ type: 'radio', label: 'Duration of consent', options: ['This event only', 'One year', 'Indefinitely'], required: true },
					{ type: 'signature', label: 'Signature', required: true },
					{ type: 'date', label: 'Date', required: true },
				],
			},
		],
	},
];
