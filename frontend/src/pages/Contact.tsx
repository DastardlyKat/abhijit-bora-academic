import type { CSSProperties } from "react"

import "./Contact.css"

import Card from "../components/Card"
import Button from "../components/Button"
import Reveal from "../components/Reveal"
import PageHeader from "../components/PageHeader"

export default function Contact() {
    return (
        <div>
            <PageHeader title="Get in Touch" description="For academic collaborations, media inquiries, or student queries" />

            <div className="contact">
                <div className="contact__form seq" style={{ "--d": "440ms" } as CSSProperties}>
                    <Card as="section" className="form-card">
                        {/* Send is not connected to a backend yet (same as before); Enter just doesn't reload the page. */}
                        <form className="form" onSubmit={e => e.preventDefault()} noValidate>
                            <div className="field">
                                <label htmlFor="c-name" className="field__label">Name</label>
                                <input id="c-name" name="name" type="text" autoComplete="name" placeholder="Your Name" className="field__control" />
                            </div>
                            <div className="field">
                                <label htmlFor="c-email" className="field__label">Email</label>
                                <input id="c-email" name="email" type="email" autoComplete="email" placeholder="Your Email" className="field__control" />
                            </div>
                            <div className="field">
                                <label htmlFor="c-subject" className="field__label">Subject</label>
                                <select id="c-subject" name="subject" className="field__control field__control--select" defaultValue="">
                                    <option value="">Select a subject</option>
                                    <option value="collaboration">Academic Collaboration</option>
                                    <option value="media">Media Inquiry</option>
                                    <option value="student">Student Query</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="field">
                                <label htmlFor="c-message" className="field__label">Message</label>
                                <textarea id="c-message" name="message" placeholder="Write your message here..." rows={6} className="field__control field__control--area" />
                            </div>
                            <Button type="submit" style={{ width: "100%" }}>Send Message</Button>
                        </form>
                    </Card>
                </div>

                <div className="contact__aside">
                    <Reveal as="dl" className="details">
                        <div className="details__row">
                            <dt>Phone</dt>
                            <dd>(+91) 98640 72390</dd>
                        </div>
                        <div className="details__row">
                            <dt>Email</dt>
                            <dd><a className="link" href="mailto:abhijit71bora@gmail.com">abhijit71bora@gmail.com</a></dd>
                        </div>
                        <div className="details__row">
                            <dt>Office Hours</dt>
                            <dd>Mon–Fri, 9:30 AM – 5:00 PM</dd>
                        </div>
                        <div className="details__row">
                            <dt>Office Address</dt>
                            <dd><a className="link" href="https://www.tezu.ernet.in/dmass/">Department of MCJ, Tezpur University</a></dd>
                        </div>
                    </Reveal>

                    <Reveal className="map" delay={120}>
                        <iframe
                            title="Department of Mass Communication and Journalism, Tezpur University map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14257.767967938467!2d92.82150409742714!3d26.69832330004936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3744ebb8a144722f%3A0x7be541ef42caac75!2sDepartment%20of%20Mass%20Communication%20and%20Journalism%2C%20Napaam%2C%20Parmai%20Gauli%20Gaon%2C%20Tezpur%2C%20Assam%20784028!5e0!3m2!1sen!2sin!4v1775755062095!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            loading="lazy"
                        />
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
