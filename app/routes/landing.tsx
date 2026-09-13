import type { Route } from "./+types/home";
import notable_logo from '../images/notable_logo.png'
import { Link, redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notable" },
    { name: "description", content: "A better way to study with flashcards." },
  ];
}

export async function loader({request} : Route.LoaderArgs){
  const {getUserId} = await import('../sessions.server')
  const userId = await getUserId(request)

  if(userId){
    return redirect('/main')
  }
}

export default function Landing(){
  return(
      <div className="landing">
        <div className="landing-board">
          <header className="landing-hero">
            <nav className="landing-nav">
              <Link to="/" className="landing-brand">
                <img src={notable_logo} alt="Notable" />
              </Link>
              <div className="landing-nav-links">
                <Link to="/loginregister?type=login">Log in</Link>
                <Link className="landing-cta" to="/loginregister?type=signup">Get started</Link>
              </div>
            </nav>
            <div className="landing-hero-copy">
              <h1>Get ready for an easier study session.</h1>
              <p>Make your own flashcards, quiz yourself, and keep going until it sticks.</p>
              <Link className="landing-cta landing-cta-lg" to="/loginregister?type=signup">Get started</Link>
            </div>
            <div className="landing-wave" aria-hidden="true"></div>
          </header>
          <section className="landing-topics" aria-hidden="true">
            <article>
              <div className="auth-float-top auth-float-mint"></div>
              <p>Biology</p>
            </article>
            <article>
              <div className="auth-float-top auth-float-sky"></div>
              <p>History</p>
            </article>
            <article>
              <div className="auth-float-top auth-float-peach"></div>
              <p>Vocabulary</p>
            </article>
            <article>
              <div className="auth-float-top auth-float-lemon"></div>
              <p>Formulas</p>
            </article>
          </section>
        </div>
      </div>
  )
}
