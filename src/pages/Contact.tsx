import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="contact-page">
        <div className="page-header">
          <h1>Contact Us</h1>
          <p>
          </p>
        </div>

        <div className="contact-container">
          <div className="contact-info">
            <h3>Collaborations</h3>
            <p>
              Our lab entertains collaborations with researchers in both academia and industry. We are particularly
              interested to learn from and work with researchers focused on AI for science and automated scientific discovery,
              irrespective of the application domain. Interested in working with us? Get in touch with our{' '}
              <Link to="/team">
                <span style={{ color: '#00AAFF' }}>team</span>
              </Link>.
            </p>

            <h3>Job Openings</h3>
            For open positions, please refer to our <Link to="/join-us">
              <span style={{ color: '#00AAFF' }}>job openings</span>
            </Link>.

            <h3>Press Inquiries</h3>
            <p>
              For press inquiries, please contact{' '}
              <a href="mailto:office-spa@uni-osnabrueck.de">
                <span style={{ color: '#00AAFF' }}>Julia Reuter</span>
              </a>{' '}
              or{' '}
              <a href="mailto:sebastian.musslick@uos.de">
                <span style={{ color: '#00AAFF' }}>Sebastian Musslick</span>
              </a>.
            </p>
          </div>

          <div className="contact-location">
            <h3>Visit Us</h3>
            <p>
              Room 50/204<br />
              Institute of Cognitive Science,<br />
              Osnabrück University<br />
              Wachsbleiche 27, 49090 Osnabrück, Germany
            </p>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem' }}>
              <iframe
                title="Lab Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2431.6378807193013!2d8.041491476653645!3d52.286828772005245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47ba4f3fdc55d7e3%3A0x44f1a6b1807c465!2sWachsbleiche%2027%2C%2049090%20Osnabr%C3%BCck%2C%20Germany!5e0!3m2!1sen!2sus!4v1713780708326!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
