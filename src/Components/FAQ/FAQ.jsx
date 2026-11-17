import React, { useState } from "react";
import { Phone, Mail, MapPin, Plus } from "lucide-react";
import "./FAQ.css";

const questions = [
  {
    question: "Can I customize my Sri Lanka itinerary?",
    answer: "Absolutely. Tell us your travel dates, interests, budget, and preferred pace, and we’ll shape a private journey around you.",
  },
  {
    question: "What is included in a tour package?",
    answer: "Inclusions depend on the journey you choose. We’ll clearly confirm your transport, stays, guides, activities, and any entrance tickets before you book.",
  },
  {
    question: "Do you arrange airport pickup and transfers?",
    answer: "Yes. We can arrange airport pickup, drop-off, and comfortable private transport throughout your trip.",
  },
  {
    question: "Can you help with hotels and activities?",
    answer: "Yes. We can recommend stays and plan experiences such as cultural visits, wildlife safaris, scenic rail journeys, and beach time.",
  },
  {
    question: "How do I request a quote?",
    answer: "Use our Plan My Trip form and share your dates, group size, and wish list. We’ll follow up with a tailored proposal.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-shell">
        <div className="faq-main">
          <header className="faq-heading">
            <span className="faq-eyebrow">Good to know</span>
            <h2 id="faq-title">Frequently asked questions</h2>
            <p>Helpful answers before your Sri Lankan adventure begins.</p>
          </header>

          <div className="faq-list">
            {questions.map(({ question, answer }, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-answer-${index}`;

              return (
                <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={question}>
                  <h3>
                    <button
                      type="button"
                      className="faq-question"
                      id={`faq-question-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    >
                      <span>{question}</span>
                      <Plus size={19} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="faq-answer"
                    id={panelId}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    aria-hidden={!isOpen}
                  >
                    <div><p>{answer}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="faq-contact" aria-labelledby="faq-contact-title">
          <div>
            <span className="faq-eyebrow">Get in touch</span>
            <h3 id="faq-contact-title">Contact Menty Tours</h3>
            <p>Speak with our local team about your Sri Lanka journey.</p>
          </div>
          <dl className="faq-contact__details">
            <div><Phone size={21} aria-hidden="true" /><dt>Call or WhatsApp</dt><dd><a href="tel:+94777174175">+94 777 174 175</a><a className="faq-contact__whatsapp" href="https://wa.me/94777174175" target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a></dd></div>
            <div><Mail size={21} aria-hidden="true" /><dt>Email</dt><dd><a href="mailto:mentytours.sl@gmail.com">mentytours.sl@gmail.com</a></dd></div>
            <div><MapPin size={21} aria-hidden="true" /><dt>Find us</dt><dd><address>47/9, Thissa Road,<br />Wadduwa, Sri Lanka</address></dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
