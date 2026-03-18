import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Star, Users, Briefcase, Code, Database, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectOverview: React.FC = () => {
    const navigate = useNavigate();

    const team = [
        {
            name: "Prasad Sarkate",
            role: "Team Leader & Lead Developer",
            description: "Architected the entire Full-Stack solution. Handled React Frontend, PHP Backend, and Database Design.",
            image: "/images/team/prasad.jpg",
            skills: ["React", "PHP", "MySQL", "System Design"],
            isLeader: true
        },
        {
            name: "Yash Dalvee",
            role: "Backend Developer",
            description: "Managed server-side logic, database architecture, and ensuring secure API integrations.",
            image: "/images/team/yash.jpg",
            skills: ["PHP", "MySQL", "API Security", "Server Management"],
            isLeader: false
        },
        {
            name: "Gaurav Ravankar",
            role: "Frontend Developer",
            description: "Specialized in building responsive UI components and ensuring smooth user experience.",
            image: "/images/team/gaurav.jpeg",
            skills: ["React", "Tailwind CSS", "JavaScript", "UI/UX"],
            isLeader: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
            {/* Hero Section */}
            <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container relative mx-auto px-4 text-center">
                    <Badge className="mb-4 bg-white/10 hover:bg-white/20 text-white border-0 px-4 py-1.5 backdrop-blur-md">
                        <Star className="w-3.5 h-3.5 mr-2 text-yellow-400 fill-yellow-400" />
                        Final Year Project
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        Meet The Creators
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        HexaCore Classes is the result of passion, engineering logic, and a mission to democratize education.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="container mx-auto px-4 -mt-16 relative z-10 mb-20">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                    <CardContent className="p-8 md:p-12 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
                        <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-lg leading-relaxed">
                            "To build a robust Learning Management System (LMS) that bridges the gap between students and quality resources. We believe in
                            <span className="font-semibold text-blue-600 dark:text-blue-400"> Free Education for All</span>, leveraging modern technology to deliver a seamless learning experience."
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            {[
                                { icon: Code, label: "Modern Stack", desc: "React + PHP" },
                                { icon: Database, label: "Secure Data", desc: "MySQL + PDO" },
                                { icon: Globe, label: "Real World", desc: "Live Deployment" },
                                { icon: Users, label: "Student First", desc: "User Centric" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-700 dark:text-slate-200">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.label}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Grid */}
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">The Team Behind HexaCore</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, idx) => (
                        <div key={idx} className="relative group">
                            {member.isLeader && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 px-4 py-1 shadow-lg flex items-center gap-1.5">
                                        <Star className="w-3 h-3 fill-white" />
                                        Team Lead
                                    </Badge>
                                </div>
                            )}

                            <Card className={`h-full overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${member.isLeader ? 'ring-2 ring-yellow-500/20' : ''}`}>
                                <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                                    <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/[0.2] bg-[length:20px_20px]" />
                                </div>

                                <CardContent className="pt-0 relative px-8 pb-8 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full p-2 bg-white dark:bg-slate-900 -mt-16 mb-4 shadow-sm relative z-10">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full rounded-full object-cover object-top"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">{member.role}</div>

                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                        {member.description}
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-2">
                                        {member.skills.map((skill, sIdx) => (
                                            <Badge key={sIdx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 mt-20 text-center">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => navigate('/')}>
                    &larr; Back to Home
                </Button>
            </div>
        </div>
    );
};

export default ProjectOverview;
