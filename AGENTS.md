## Project
Task Title: Design and Develop a Responsive Event Management Website
Problem Statement:-
Develop a modern, visually appealing, and fully responsive event management website which allows users to explore upcoming events, view detailed event information, and register for their preferred events. The website should provide an engaging user experience with a clean interface, intuitive navigation, and interactive components.
The homepage should introduce the platform through an attractive hero section, followed by a section showcasing upcoming and featured events. Each event should have its own card displaying relevant information such as the event name, date, venue, image, and a short description. Users should be able to browse events, search for specific events, and filter them based on categories.
When a user selects an event, the website should provide detailed information about it along with a registration option. The registration form should collect essential details such as the participant's name, email address, phone number, and selected event. Implement appropriate JavaScript-based form validation to ensure that users enter valid information before submitting the form. Upon successful submission, display a confirmation message to the user.
The website must be responsive across mobile phones, tablets, and desktop screens. Students are encouraged to focus on good UI/UX practices, consistent styling, smooth transitions, and interactive elements to make the platform visually appealing and easy to use.
Technical Requirements:-
Students must use HTML5, CSS3, and JavaScript to develop the website. They may optionally use Tailwind CSS or React.js. Git and GitHub must be used for version control and project submission.
Bonus Challenge:-
Students can enhance their projects by implementing dark/light mode, event countdown timers, animations, and Local Storage-based registration data management.
Submission Requirements:-
Students must submit their GitHub repository link along with the deployed website link using platforms such as Vercel. A README file explaining the project and its implementation must also be included.
Evaluation: Creativity, UI/UX, functionality, responsiveness, code quality, GitHub documentation and successful deployment will be considered during evaluation.

## File responsibilities

## Data model (source of truth; changes must be logged in DECISIONS.md)
Event: { id, title, category, date (ISO string), time, venue, image, shortDescription, description, capacity, featured }
Registration: { id, eventId, name, email, phone, registeredAt }

## Rules
Comment non-obvious logic only. Use clear names: camelCase JS, kebab-case CSS classes.
Don't commit. Report which files you changed and what functions you exported.
If a task needs a change outside your files, stop and
tell me instead of making it.
Keep modules small; export named functions; no global variables.
Semantic HTML, alt text on images, labels on all inputs, visible focus states (accessibility counts).

## Done means
Works in the browser with no console errors, looks right at 375px, 768px, 1280px,
and matches the data model above.