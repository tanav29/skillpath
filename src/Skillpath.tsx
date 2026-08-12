import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ArrowLeftRight, CircleAlert, RefreshCw, Search, X } from "lucide-react";

const API = "https://syncsphere-hiv6.onrender.com";

type Course = {
  courseName: string;
  courseCode: string;
  description: string;
  mainCategory: string;
  shortCourse: string;
  courseType: string;
  pricePaise: number;
  priceUsdCents: number;
  refundable: boolean;
};
export type Props = { accentColor?: string; cardRadius?: number };

export default function Skillpath({
  accentColor = "#e3ff5c",
  cardRadius = 20,
}: Props) {
  const [currency, setCurrency] = useState<"IN" | "US">("IN");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();
  const coursesQuery = useQuery<Course[]>({
    queryKey: ["skillpath", "courses"],
    queryFn: async () => {
      const response = await fetch(`${API}/assignment/course-data`, { method: "GET" });
      if (!response.ok) throw new Error("Courses request failed");
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("Courses response was not an array");
      return data as Course[];
    },
    staleTime: 60_000,
    retry: 2,
  });
  const countryQuery = useQuery<{ country_code: "IN" | "US" }>({
    queryKey: ["skillpath", "country"],
    queryFn: async () => {
      const response = await fetch(`${API}/assignment/country-code`, { method: "GET" });
      if (!response.ok) throw new Error("Country request failed");
      return (await response.json()) as { country_code: "IN" | "US" };
    },
    staleTime: 60_000,
    retry: 2,
  });
  const courses = coursesQuery.data ?? [];
  const status = coursesQuery.isPending ? "loading" : coursesQuery.isError ? "error" : "ready";
  const countryAvailable = !countryQuery.isError;
  const refreshCourses = () => {
    void queryClient.invalidateQueries({ queryKey: ["skillpath"] });
  };
  const detectedCountry = countryQuery.data?.country_code;
  useEffect(() => {
    if (detectedCountry) setCurrency(detectedCountry);
  }, [detectedCountry]);

  const visibleCourses = useMemo(() => {
    const filtered = courses.filter((c) =>
      `${c.courseName} ${c.description} ${c.mainCategory} ${c.shortCourse}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    const amount = (course: Course) =>
      currency === "IN" ? course.pricePaise : course.priceUsdCents;
    return [...filtered].sort((a, b) =>
      sort === "low"
        ? amount(a) - amount(b)
        : sort === "high"
          ? amount(b) - amount(a)
          : 0,
    );
  }, [courses, query, sort, currency]);

  const price = (course: Course) =>
    currency === "IN"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(course.pricePaise / 100)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(course.priceUsdCents / 100);

  return (
    <main
      style={
        {
          "--accent": accentColor,
          "--radius": `${cardRadius}px`,
        } as React.CSSProperties
      }
    >
      <nav className="nav shell">
        <a className="brand" href="#top">
          <span className="brand-mark">S</span>
          <span>
            skillpath<span className="dot">.</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#courses">Explore</a>
          <a href="#about">Our approach</a>
          <a href="#footer">
            Sign in <span aria-hidden>↗</span>
          </a>
        </div>
        <a className="menu" href="#courses" aria-label="Go to courses">
          ☰
        </a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="kicker">
            <span className="kicker-line" />
            Learning for the curious
          </p>
          <h1>
            Make room
            <br />
            for <em>better</em> work<span className="period">.</span>
          </h1>
          <p className="hero-lede">
            Short, sharp courses for people who'd rather make something than
            just bookmark it.
          </p>
          <a className="primary" href="#courses">
            Find your next skill <span>↓</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-card">
            <span>01</span>
            <strong>
              learn
              <br />
              in public
            </strong>
            <small>skillpath / 2024</small>
          </div>
          <div className="art-note">
            curiosity
            <br />
            is a muscle <b>↗</b>
          </div>
        </div>
      </section>

      <section className="courses shell" id="courses">
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span className="kicker-line" />
              The course shelf
            </p>
            <h2>
              Skills with a<br />
              <em>point of view.</em>
            </h2>
          </div>
          <p className="section-intro">
            No endless lectures. Just practical ideas, taught by people still
            doing the work.
          </p>
        </div>
        <div className="toolbar">
          <label className="search">
            <Search size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
            />
          </label>
          <div className="toolbar-actions">
            <label className="sort">
              Sort by{" "}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
            <button
              className="tool-button"
              onClick={() => setCurrency(currency === "IN" ? "US" : "IN")}
              aria-label={`Switch to ${currency === "IN" ? "US dollars" : "Indian rupees"}`}
            >
              {currency === "IN" ? "₹ INR" : "$ USD"} <ArrowLeftRight size={14} aria-hidden="true" />
            </button>
            <button
              className="tool-button refresh"
              onClick={refreshCourses}
              aria-label="Refresh courses"
            >
              <><RefreshCw size={14} aria-hidden="true" /> Refresh</>
            </button>
          </div>
        </div>
        {!countryAvailable && status === "ready" && (
          <div className="notice" role="status">
            Location pricing is unavailable. You can still switch currency
            manually.
          </div>
        )}
        {status === "loading" && (
          <div className="grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="skeleton" key={i}>
                <i />
                <b />
                <span />
                <span />
              </div>
            ))}
          </div>
        )}
        {status === "error" && (
          <div className="state">
            <div className="state-icon"><CircleAlert size={18} aria-hidden="true" /></div>
            <h3>That page took a wrong turn.</h3>
            <p>
              We couldn't load the course shelf. The API is having a moment.
            </p>
            <button onClick={refreshCourses}>
              Try again <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        )}
        {status === "ready" && visibleCourses.length === 0 && (
          <div className="state">
            <div className="state-icon"><Search size={18} aria-hidden="true" /></div>
            <h3>Nothing matched.</h3>
            <p>
              Try a different search, or clear the filter to see the full shelf.
            </p>
            <button onClick={() => setQuery("")}>
              Show all courses <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        )}
        {status === "ready" && visibleCourses.length > 0 && (
          <div className="grid">
            {visibleCourses.map((course, index) => (
              <article
                className="course-card"
                key={course.courseCode || index}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCourse(course)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCourse(course);
                  }
                }}
                aria-label={`View details for ${course.courseName}`}
              >
                <div className="card-top">
                  <span className="number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="tag">{course.mainCategory}</span>
                </div>
                <div>
                  <h3>{course.courseName}</h3>
                  <p>{course.description}</p>
                </div>
                <div className="card-bottom">
                  <div>
                    <strong>{price(course)}</strong>
                    <small>
                      {course.courseType} · {course.shortCourse}
                    </small>
                  </div>
                  {course.refundable && (
                    <span className="refund">Refundable</span>
                  )}
                  <ArrowUpRight className="arrow" size={20} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        )}
        {selectedCourse && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="course-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-course-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close course details"
              ><X size={22} aria-hidden="true" /></button>
              <div className="modal-label">
                {selectedCourse.mainCategory} · {selectedCourse.courseType}
              </div>
              <h3 id="modal-course-title">{selectedCourse.courseName}</h3>
              <p className="modal-description">{selectedCourse.description}</p>
              <div className="modal-details">
                <div><small>Format</small><strong>{selectedCourse.shortCourse}</strong></div>
                <div><small>Price</small><strong>{price(selectedCourse)}</strong></div>
                <div><small>Refund policy</small><strong>{selectedCourse.refundable ? "Refundable" : "Non-refundable"}</strong></div>
              </div>
              <button className="primary modal-cta" onClick={() => setSelectedCourse(null)}>
                Start learning <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="manifesto shell" id="about">
        <span className="manifesto-mark">✳</span>
        <p>
          Good learning should leave
          <br />
          <em>a mark on how you work.</em>
        </p>
        <span className="manifesto-aside">
          Built for
          <br />
          the in-between.
        </span>
      </section>
      <footer className="footer shell" id="footer">
        <a className="brand" href="#top">
          <span className="brand-mark">S</span>
          <span>
            skillpath<span className="dot">.</span>
          </span>
        </a>
        <div className="footer-links">
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
          <a href="mailto:hello@skillpath.co">Contact</a>
        </div>
        <small>© 2024 Skillpath. Keep going.</small>
      </footer>
    </main>
  );
}

// Preview-only metadata; the Framer registration lives in Skillpath.framer.tsx.
export const propertyControls = {
  accentColor: { type: "Color", title: "Accent", defaultValue: "#e3ff5c" },
  cardRadius: {
    type: "Number",
    title: "Card radius",
    min: 0,
    max: 36,
    step: 2,
    defaultValue: 20,
  },
};
