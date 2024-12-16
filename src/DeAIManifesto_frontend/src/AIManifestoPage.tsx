import { DeAIManifesto_backend } from '../../declarations/DeAIManifesto_backend';

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import { organizationSignees } from './helpers/organization_signees.js';

const principles = [
  {
    number: "01",
    title: "DeAI Is Safe AI",
    description:
      "DeAI prioritizes user safety by implementing robust security measures and rigorous testing protocols to minimize the risk of unintended consequences or malicious exploitation.",
  },
  {
    number: "02",
    title: "DeAI Is Self-Sovereign AI",
    description:
      "Users should have complete control over their AI. Your AI should work for you, reflect your values, and serve your needs without external interference.",
  },
  {
    number: "03",
    title: "DeAI Is Secure AI",
    description:
      "Privacy is a guarantee, not just a feature. DeAI ensures your data remains your own, safe from prying eyes and misuse.",
  },
  {
    number: "04",
    title: "DeAI Is Accessible AI",
    description:
      "DeAI makes advanced AI available to all. Extending the principles of the World Wide Web to AI, it is inclusive in the users it serves and in the supported interaction methods.",
  },
  {
    number: "05",
    title: "DeAI Is Participatory AI",
    description:
      "By allowing open contributions and attributing the created value back to the owner, DeAI enables everyone to participate in shaping the AI revolution and benefiting from it.",
  },
  {
    number: "06",
    title: "DeAI Is Responsible AI",
    description:
      "User empowerment and respecting stakeholders’ best interests are topmost priorities for DeAI. This includes best efforts to be resource-efficient and deliver sustainable solutions.",
  },
  {
    number: "07",
    title: "DeAI Is Verifiable AI",
    description:
      "Enabling thorough inspection and verification of DeAI systems promotes transparency of the underlying code and algorithms, as well as accountability to identify and rectify errors or biases in the AI's behavior.",
  },
];

interface ManifestoPrincipleProps {
  number: string;
  title: string;
  description: string;
}

const ManifestoPrinciple: React.FC<ManifestoPrincipleProps> = ({
  number,
  title,
  description,
}) => {
  return (
    <section className="flex flex-col w-full md:max-w-[660px] mt-20 md:mt-10 md:self-center tw-lead md:tw-lead-lg font-circular font-book">
      <div className="flex items-start gap-3">
        <span className="text-white/30">{number}</span>
        <h2 className="text-white md:mt-[0.4rem]">{title}</h2>
      </div>
      <p className="text-white mt-3 tw-lead-sm">{description}</p>
    </section>
  );
};

const AIManifestoPage: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const overlayRef = useRef<HTMLDivElement>();

  const [organizations, setOrganizations] = useState(organizationSignees);
  const [individuals, setIndividuals] = useState([]);
  const [newSupporter, setNewSupporter] = useState({ name: "", emailAddress: "", type: "individual", title: "", organization: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchIndividualSignees = async () => {
      try {
        const names = await DeAIManifesto_backend.get_manifesto_signee_names();
        setIndividuals(names.map((name) => ({ name }))); // Map backend response to the expected structure
      } catch (error) {
        console.error("Error fetching individual signees:", error);
      };
    };
  
    fetchIndividualSignees();
  }, []);  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupporter((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for name and email
    if (!newSupporter.name || !newSupporter.emailAddress) {
      setMessage("Please provide both your name and email address.");
      return;
    };
    const sanitizeInput = (input, fieldName) => {
      // Define allowed regex for valid characters (Latin letters, spaces, hyphens, apostrophes)
      const validRegex = /^[\p{L}\s\-']+$/u;
    
      // Check for empty or overly long fields
      if (fieldName === "Name" || fieldName === "Email") {
        if (input.length === 0) {
          throw new Error(`${fieldName} cannot be empty.`);
        };
      };
      
      if (input.length > 40) {
        throw new Error(`${fieldName} cannot exceed 40 characters.`);
      };
    
      // Validate characters for name, title, and organization
      if (!validRegex.test(input)) {
        throw new Error(`${fieldName} contains invalid characters.`);
      };
    
      return input.trim(); // Trim whitespace
    };    

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeInput(newSupporter.name, "Name");
      const sanitizedTitle = newSupporter.title ? sanitizeInput(newSupporter.title, "Title") : "";
      const sanitizedOrganization = newSupporter.organization ? sanitizeInput(newSupporter.organization, "Organization") : "";

      // Basic email validation
      if (!newSupporter.emailAddress.includes("@") || newSupporter.emailAddress.length > 40 || newSupporter.emailAddress.length < 4) {
        throw new Error("Please provide a valid email address.");
      };

      // Prepare input for backend
      const submittedSignUpForm = {
        name: sanitizedName,
        emailAddress: newSupporter.emailAddress.trim(),
        title: [sanitizedTitle] as unknown as [string],
        organization: [sanitizedOrganization] as unknown as [string],
      };
    
      // Submit to backend
      const resultMessage = await DeAIManifesto_backend.submit_signup_form(submittedSignUpForm);
      setMessage(resultMessage);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error submitting sign-up form:", error);
      setMessage("Submission failed. Please try again.");
    };
  };

  return (
    <motion.div
      className="fixed inset-0 overflow-auto z-[2000] bg-[#0C0025]/90 backdrop-blur-lg overflow-x-hidden"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={overlayRef}
    >
      <div className="absolute top-4 right-4 z-50">
        <a
          href="https://github.com/DeAIWorkingGroupInternetComputer/ManifestoForDecentralizedAI"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="./GitHub-logo.png"
            alt="GitHub Repository"
            className="h-11"
          />
        </a>
      </div>
      <div className="fixed inset-0"></div>
      <div
        className="relative container-10 px-6 py-12 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:top-20 z-10 pr-0 md:pr-8 ">
          {" "}
          <div className="flex flex-col py-6 ">
            <section className="md:self-center flex flex-col md:max-w-[660px] mt-[92px] md:mt-[40px] font-circular font-book text-white">
              <h1 className="tw-title-sm md:tw-title-lg">
                Manifesto for Decentralized AI (DeAI)
              </h1>
              <p className="tw-lead-sm md:tw-lead mt-6">
                In an era where Artificial Intelligence (AI) is increasingly central to our daily lives, this ubiquitous use of AI in applications ranging from mundane to critical tasks has powerful forces racing to establish control; the power over these transformative technologies, though, must not be confined to a few centralized entities. The Internet has brought tremendous decentralization of access to information and ease of communication, but also the centralization of power and corporate ownership of data. This trend will worsen if left unchecked. The principles of Decentralized AI (DeAI) can reverse this trend if users and application developers recognize its importance to their long-term welfare. We envision a future where AI is democratized, broadly empowering, and adaptive to the diverse needs and values of all users, groups, and their contexts. This manifesto lays out the principles and reasons for decentralizing AI and advocates for a fair, transparent, and user-centric AI ecosystem.
              </p>
            </section>
            {principles.map((principle, index) => (
              <ManifestoPrinciple
                key={index}
                number={principle.number}
                title={principle.title}
                description={principle.description}
              />
            ))}
            <section className="md:self-center flex flex-col md:max-w-[660px] mt-20 md:mt-10 font-circular font-book">
              <p className="text-white tw-lead-sm md:tw-lead">
                Join us in the movement towards Decentralized AI. Together, we can create an AI ecosystem that works for everyone, maximizes contributions to a prosperous future for all beings on the planet, and provides control, privacy, and fairness in the AI technologies that shape our lives.
              </p>
            </section>
          </div>
          <div className="flex flex-col py-6 ">
            <section className="mt-10 font-circular font-book">
              <h2 className="text-white text-2xl mb-6">Sign the Manifesto</h2>
              <form onSubmit={handleFormSubmit} className="mb-10">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-white mb-2">
                    First and Last Name<span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newSupporter.name}
                    onChange={handleInputChange}
                    className="w-80 p-2 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="emailAddress" className="block text-white mb-2">
                    Email Address<span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={newSupporter.emailAddress}
                    onChange={handleInputChange}
                    className="w-80 p-2 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newSupporter.title || ""}
                    onChange={handleInputChange}
                    className="w-80 p-2 text-black"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="organization" className="block text-white mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={newSupporter.organization || ""}
                    onChange={handleInputChange}
                    className="w-80 p-2 text-black"
                  />
                </div>
                <button type="submit" className="bg-blue-900 text-black px-4 py-2">Sign Manifesto</button>
              </form>
              {message && <p className="text-yellow-400 mb-4">{message}</p>}

              {/* Organizations List */}
              <h2 className="text-white text-2xl mb-6">Organizations for DeAI</h2>
              <ul className="mb-10">
                {organizations.map((org, index) => (
                  <li key={index} className="flex items-center mb-4">
                    <a href={org.url} target="_blank">
                      <img src={org.logo} alt={org.name} className="w-40 mr-4" />                                        
                    </a>
                    {/* <span>{org.name}</span> */}
                  </li>
                ))}
              </ul>

              <p className="text-white mb-6">
                Sign the manifesto as an organization or project and add your logo to the list {" "}
                <a
                  href="https://github.com/DeAIWorkingGroupInternetComputer/ManifestoForDecentralizedAI/blob/main/README_signAsOrganization.md"
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  by following this simple guide.
                </a>
              </p>

              {/* Individuals List */}
              <h2 className="text-white text-2xl mt-8 mb-6">Individuals for DeAI</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 list-none">
                {individuals.map((person, index) => (
                  <li key={index} className="mb-2 text-center md:text-left">
                    {person.name}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIManifestoPage;

