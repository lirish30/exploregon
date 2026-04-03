type NewsletterSignupProps = {
  title?: string
  copy?: string
  placeholder?: string
  buttonLabel?: string
}

export const NewsletterSignup = ({
  title = 'Get local tide, event, and travel tips.',
  copy = 'Join the field notes list for practical planning updates from across the Oregon Coast.',
  placeholder = 'Enter your email',
  buttonLabel = 'Subscribe'
}: NewsletterSignupProps) => {
  return (
    <section className="newsletter" aria-label="Newsletter sign up">
      <div className="newsletter-inner">
        <h2 className="newsletter-title">{title}</h2>
        <p className="newsletter-copy">{copy}</p>
        <form className="newsletter-form" action="#" method="post">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="input-field"
          />
          <button type="submit" className="button-primary">
            {buttonLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
