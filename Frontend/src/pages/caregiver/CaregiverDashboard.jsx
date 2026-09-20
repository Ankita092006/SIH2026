import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  TrendingUp,
  Pill,
  Bell,
  Brain,
  ArrowRight,
} from "lucide-react";

const CaregiverDashboard = () => {
  const modules = [
    {
      title: "Patient Profile",
      description: "View patient information and daily activity.",
      icon: User,
      path: "/caregiver/patient",
    },
    {
      title: "Trends",
      description: "Monitor cognitive performance and progress.",
      icon: TrendingUp,
      path: "/caregiver/trends",
    },
    {
      title: "Adherence",
      description: "Track medication and reminder adherence.",
      icon: Pill,
      path: "/caregiver/adherence",
    },
    {
      title: "Alerts",
      description: "Check important patient alerts and notifications.",
      icon: Bell,
      path: "/caregiver/alerts",
    },
    {
      title: "Memory Library",
      description: "Access saved memories and meaningful information.",
      icon: Brain,
      path: "/caregiver/memory",
    },
  ];

  return (
    <div className="caregiver-dashboard">
      <div className="caregiver-header">
        <div>
          <p className="caregiver-label">CAREGIVER MODULE</p>
          <h1>Caregiver Dashboard</h1>
          <p>
            Monitor your patient's progress, adherence, alerts and memories
            from one place.
          </p>
        </div>
      </div>

      <div className="caregiver-welcome-card">
        <div>
          <h2>Welcome, Caregiver</h2>
          <p>
            Stay connected with the patient's daily activities and cognitive
            wellness.
          </p>
        </div>
        <User size={42} />
      </div>

      <div className="caregiver-section">
        <h2>Patient Overview</h2>

        <div className="caregiver-overview-grid">
          <div className="caregiver-stat-card">
            <span>Patient</span>
            <strong>Robert Smith</strong>
          </div>

          <div className="caregiver-stat-card">
            <span>Age</span>
            <strong>72 years</strong>
          </div>

          <div className="caregiver-stat-card">
            <span>Today's Status</span>
            <strong>Active</strong>
          </div>
        </div>
      </div>

      <div className="caregiver-section">
        <h2>Caregiver Tools</h2>

        <div className="caregiver-module-grid">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.title}
                to={module.path}
                className="caregiver-module-card"
              >
                <div className="caregiver-module-icon">
                  <Icon size={28} />
                </div>

                <div>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>

                <ArrowRight size={20} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
