export default function About() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif text-[#C9A55C] mb-6">Welcome to CozyHotel</h1>
                    <div className="w-24 h-[2px] bg-[#C9A55C] mx-auto mb-6"></div>
                    <p className="text-xl text-gray-300 font-light">Your Premier Destination for Luxury Hotel Reservations</p>
                </div>

                <div className="space-y-12">
                    <section className="luxury-card p-8">
                        <h2 className="text-2xl font-serif text-[#C9A55C] mb-6">Our Story</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Founded with a vision to revolutionize the hotel booking experience, CozyHotel has emerged as the industry leader in luxury hotel reservations. Our journey began with a simple belief where every traveler deserves an exceptional stay, and every hotel deserves to showcase its unique charm.
                        </p>
                    </section>

                    <section className="luxury-card p-8">
                        <h2 className="text-2xl font-serif text-[#C9A55C] mb-6">Why Choose Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-serif text-white">Exclusive Partnerships</h3>
                                <p className="text-gray-300">We've curated relationships with the world's most prestigious hotels, offering you access to exclusive rates and special amenities.</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-serif text-white">24/7 Support</h3>
                                <p className="text-gray-300">Our dedicated team is always ready to assist you, ensuring a seamless booking experience from start to finish.</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-serif text-white">Best Price Guarantee</h3>
                                <p className="text-gray-300">We're committed to offering you the most competitive rates, backed by our price match guarantee.</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-serif text-white">Luxury Experience</h3>
                                <p className="text-gray-300">Every booking is crafted with attention to detail, ensuring your stay exceeds expectations.</p>
                            </div>
                        </div>
                    </section>

                    <section className="luxury-card p-8">
                        <h2 className="text-2xl font-serif text-[#C9A55C] mb-6">Our Mission</h2>
                        <p className="text-gray-300 leading-relaxed">
                            At CozyHotel, we're dedicated to transforming ordinary hotel stays into extraordinary experiences. Our mission is to connect discerning travelers with exceptional accommodations while providing unparalleled service and support throughout their journey.
                        </p>
                    </section>

                    <section className="luxury-card p-8">
                        <h2 className="text-2xl font-serif text-[#C9A55C] mb-6">Join Our Journey</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Whether you're planning a romantic getaway, a family vacation, or a business trip, CozyHotel is your trusted partner in creating unforgettable hotel experiences. Start your journey with us today and discover why we're the preferred choice for luxury hotel reservations worldwide.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}