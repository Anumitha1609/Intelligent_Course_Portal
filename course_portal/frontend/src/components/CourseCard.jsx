import "./CourseCard.css";

const svg = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function CourseCard({ course }) {
  return (
    <div className="cc">
      <div
        className="cc-banner"
        style={
          course.image
            ? { backgroundImage: `url(${course.image})` }
            : { background: course.accent }
        }
      >
        <span className="cc-cat">{course.category}</span>
      </div>

      <div className="cc-body">
        <h3>{course.name}</h3>
        <p>{course.description}</p>

        <div className="cc-meta">
          <span>
            <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {course.duration}
          </span>
          <span>
            <svg {...svg}><path d="M6 20V10M12 20V4M18 20v-7" /></svg>
            {course.level}
          </span>
        </div>

        <button type="button" className="cc-btn">
          View Details
          <svg {...svg}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

export default CourseCard;
