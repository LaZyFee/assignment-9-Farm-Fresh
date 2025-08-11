import React from "react";
import { FaHandshake, FaTruck } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";

export const WhyChooseUs = () => {
    return (
        <section className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Choose FarmFresh?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We connect you directly with local farmers for the freshest produce
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            icon: <FaTruck className="text-3xl text-primary-600 dark:text-primary-400" />,
                            title: "Fast Delivery",
                            desc: "Fresh produce delivered within 24 hours of harvest",
                        },
                        {
                            icon: <FaShield className="text-3xl text-primary-600 dark:text-primary-400" />,
                            title: "Quality Guaranteed",
                            desc: "100% organic and pesticide-free produce",
                        },
                        {
                            icon: <FaHandshake className="text-3xl text-primary-600 dark:text-primary-400" />,
                            title: "Support Local",
                            desc: "Direct support to local farmers and communities",
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="text-center p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
                        >
                            <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
