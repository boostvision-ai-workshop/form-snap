// The sidebar links "Forms" → /dashboard/forms, and the index /dashboard also
// shows the forms list (they are the same view). Re-export the dashboard page
// so both URLs render identically without duplicating the implementation.
export { default } from '../page';
