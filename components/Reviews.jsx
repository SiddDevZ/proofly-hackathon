import React, { useState, useEffect } from "react";

// Testimonial data customized for blockchain credential verification
const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    position: "Registrar, Harvard University",
    quote: "Proofly has revolutionized how we issue and verify degrees. The blockchain technology ensures our credentials can never be forged, giving us complete confidence in the verification process.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: 2,
    name: "James Chen",
    position: "HR Director, Google",
    quote: "Instant verification has transformed our hiring process. We can now verify candidate credentials in seconds instead of weeks, significantly speeding up our recruitment pipeline.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    position: "Computer Science Graduate",
    quote: "Having complete control over my digital credentials is amazing. I can share my degrees instantly with potential employers while maintaining my privacy.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: 4,
    name: "Prof. Michael Brown",
    position: "Dean, MIT",
    quote: "The security and immutability of blockchain technology gives us confidence that our institution's reputation is protected. No more worries about credential fraud.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: 5,
    name: "Lisa Wang",
    position: "Talent Acquisition, Microsoft",
    quote: "This platform has eliminated the administrative burden of credential verification. Our HR team can focus on what matters most - finding the right talent.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    id: 6,
    name: "Alex Johnson",
    position: "MBA Graduate, Stanford",
    quote: "The QR code sharing feature is brilliant. I can instantly prove my qualifications to anyone, anywhere in the world. It's the future of credential management.",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    id: 7,
    name: "Dr. Amanda Taylor",
    position: "Vice Chancellor, Oxford University",
    quote: "Proofly maintains the authority of our institution while modernizing the verification process. It's exactly what higher education needed.",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    id: 8,
    name: "Robert Kim",
    position: "Recruitment Manager, Tesla",
    quote: "The global recognition feature is game-changing. We can now verify international candidates' credentials instantly, opening up our talent pool worldwide.",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    id: 9,
    name: "Maria Santos",
    position: "Engineering Graduate",
    quote: "My credentials are stored securely forever. I never have to worry about losing important documents or dealing with bureaucratic verification processes again.",
    image: "https://randomuser.me/api/portraits/women/9.jpg",
  },
  {
    id: 10,
    name: "Dr. Kevin O'Brien",
    position: "President, University of California",
    quote: "The cost savings have been remarkable. We've reduced our administrative overhead while providing a better service to our graduates and employers.",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    id: 11,
    name: "Rachel Green",
    position: "HR Business Partner, Amazon",
    quote: "The transparency and trust that blockchain verification provides has streamlined our entire onboarding process. Candidates love the quick verification too.",
    image: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    id: 12,
    name: "David Park",
    position: "PhD Student, Cambridge",
    quote: "Being able to share selective details about my credentials gives me complete control over my academic privacy. The platform respects student autonomy.",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: 13,
    name: "Jennifer Lopez",
    position: "Chief People Officer, Netflix",
    quote: "The fraud prevention capabilities are outstanding. We've eliminated credential forgery completely from our hiring process.",
    image: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    id: 14,
    name: "Michael Zhang",
    position: "Dean of Admissions, Yale University",
    quote: "Our graduates love the instant sharing feature. They can prove their qualifications anywhere in the world with just a QR code.",
    image: "https://randomuser.me/api/portraits/men/14.jpg",
  },
  {
    id: 15,
    name: "Sarah Williams",
    position: "Global Recruiter, Facebook (Meta)",
    quote: "International hiring has never been easier. We can verify credentials from any university worldwide in real-time.",
    image: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    id: 16,
    name: "Prof. James Wilson",
    position: "Provost, Princeton University",
    quote: "The blockchain technology gives us complete confidence in credential integrity. It's the future of academic verification.",
    image: "https://randomuser.me/api/portraits/men/16.jpg",
  },
  {
    id: 17,
    name: "Ashley Davis",
    position: "Talent Director, Apple",
    quote: "We've reduced our verification time from weeks to seconds. The efficiency gains are remarkable for our hiring pipeline.",
    image: "https://randomuser.me/api/portraits/women/17.jpg",
  },
  {
    id: 18,
    name: "Carlos Rodriguez",
    position: "Computer Science PhD, Caltech",
    quote: "Having my credentials permanently secured on the blockchain gives me peace of mind. I'll never lose my academic achievements.",
    image: "https://randomuser.me/api/portraits/men/18.jpg",
  },
  {
    id: 19,
    name: "Dr. Linda Chen",
    position: "Chancellor, UC Berkeley",
    quote: "The cost savings have been substantial. We've eliminated entire administrative processes while improving service quality.",
    image: "https://randomuser.me/api/portraits/women/19.jpg",
  },
  {
    id: 20,
    name: "Ryan Thompson",
    position: "Head of Talent, Uber",
    quote: "The platform's global recognition feature has opened up our talent pool to candidates from universities worldwide.",
    image: "https://randomuser.me/api/portraits/men/20.jpg",
  },
  {
    id: 21,
    name: "Michelle Wang",
    position: "MBA Graduate, Wharton",
    quote: "The selective sharing feature is brilliant. I can control exactly what information employers see about my academic record.",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: 22,
    name: "Dr. Robert Martinez",
    position: "Vice President, NYU",
    quote: "Our institution's reputation is protected by the immutable nature of blockchain. Credential fraud is now impossible.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 23,
    name: "Karen Johnson",
    position: "HR Manager, Spotify",
    quote: "The verification process is so smooth now. Our new hires are impressed by how quickly we can process their credentials.",
    image: "https://randomuser.me/api/portraits/women/23.jpg",
  },
  {
    id: 24,
    name: "Daniel Kim",
    position: "Engineering Graduate, Georgia Tech",
    quote: "I can instantly prove my qualifications to any employer anywhere. The QR code feature is incredibly convenient.",
    image: "https://randomuser.me/api/portraits/men/24.jpg",
  },
  {
    id: 25,
    name: "Prof. Helen Foster",
    position: "Academic Registrar, Columbia",
    quote: "We maintain complete authority over our credentials while providing a modern, efficient verification system.",
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    id: 26,
    name: "Steve Anderson",
    position: "Recruiting Lead, Airbnb",
    quote: "The transparency and trust this platform provides has revolutionized our approach to credential verification.",
    image: "https://randomuser.me/api/portraits/men/26.jpg",
  },
  {
    id: 27,
    name: "Maria Gonzalez",
    position: "Law Graduate, Harvard Law",
    quote: "My credentials are securely stored forever. I never have to worry about losing important documents again.",
    image: "https://randomuser.me/api/portraits/women/27.jpg",
  },
  {
    id: 28,
    name: "Prof. William Lee",
    position: "President, Cornell University",
    quote: "The platform respects institutional authority while modernizing the entire verification ecosystem.",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
  },
  {
    id: 29,
    name: "Jessica Taylor",
    position: "People Operations, Slack",
    quote: "Our onboarding process is now seamless. New employees love how quickly their credentials are verified.",
    image: "https://randomuser.me/api/portraits/women/29.jpg",
  },
  {
    id: 30,
    name: "Andrew Clark",
    position: "Medical Graduate, Johns Hopkins",
    quote: "The security and permanence of blockchain technology gives me confidence in my digital credentials.",
    image: "https://randomuser.me/api/portraits/men/30.jpg",
  },
];

const ReviewChild = ({ name, position, quote, image }) => {
  return (
    <div className="child w-full rounded-2xl bg-[#0a0a0a8d] border border-white/5 p-6 mb-5 hover:border-white/10 transition-all duration-300">
      <div className="flex items-start mb-3">
        <img src={image} className="h-10 w-10 rounded-full ring-2 ring-white/10" alt="" />
        <div className="flex flex-col ml-4 min-w-0 flex-1">
          <h2 className="font-dm-sans font-medium text-white text-base truncate">{name}</h2>
          <h3 className="font-dm-sans text-sm text-[#aeaeae] mt-0.5 truncate">{position}</h3>
        </div>
      </div>
      <p className="font-dm-sans text-[#dbdbdb] text-sm leading-relaxed">{quote}</p>
    </div>
  );
};

const Reviews = () => {
  const [hoveredColumns, setHoveredColumns] = useState([false, false, false]);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = (columnIndex) => {
    setHoveredColumns((prev) => {
      const newState = [...prev];
      newState[columnIndex] = true;
      return newState;
    });
  };

  const handleMouseLeave = (columnIndex) => {
    setHoveredColumns((prev) => {
      const newState = [...prev];
      newState[columnIndex] = false;
      return newState;
    });
  };

  return (
    <div className="container mt-14 h-[120vh] overflow-hidden mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((columnIndex) => (
          <div
            key={columnIndex}
            className="relative"
            onMouseEnter={() => handleMouseEnter(columnIndex)}
            onMouseLeave={() => handleMouseLeave(columnIndex)}
          >
            <div
              className={`vertical-scroll ${
                hoveredColumns[columnIndex] ? "hovered" : ""
              } ${columnIndex === 0 || columnIndex === 2 ? "fast" : ""}`}
            >
              {[...testimonials, ...testimonials].map((testimonial, index) => {
                if (
                  (windowWidth >= 1024 && index % 3 === columnIndex) ||
                  (windowWidth >= 640 && windowWidth < 1024 && index % 2 === columnIndex % 2) ||
                  windowWidth < 640
                ) {
                  return (
                    <ReviewChild
                      key={`${testimonial.id}-${index}`}
                      name={testimonial.name}
                      position={testimonial.position}
                      quote={testimonial.quote}
                      image={testimonial.image}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews; 