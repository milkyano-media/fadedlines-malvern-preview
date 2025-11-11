import { Button } from "@/components/ui/button"; // Import the Button component. Adjust the path as needed.
import { useFeatureFlag, useParameterValue } from "@/hooks/useParameter";
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface InstagramSectionProps {
    instagram_images_desktop: { image: string; name: string }[];
    instagram_images_mobile: string[];
}

const InstagramSection: React.FC<InstagramSectionProps> = ({ instagram_images_desktop, instagram_images_mobile }) => {
    const ctaTextParameter = useParameterValue<string>("content.cta_primary_text", "Book Now");
    const bookEnabledParameter = useFeatureFlag("booking_enabled", true);

    localStorage.removeItem("booking_source");

    const location = useLocation();

    const getQueryParams = (search: string) => {
        return new URLSearchParams(search);
    };

    const queryParams = getQueryParams(location.search);
    const fbclid = queryParams.get("fbclid");
    const ttclid = queryParams.get("ttclid");
    const gclid = queryParams.get("gclid");

    const trackingData = {
        utm_source: queryParams.get("utm_source"),
        utm_medium: queryParams.get("utm_medium"),
        utm_campaign: queryParams.get("utm_campaign"),
        utm_content: queryParams.get("utm_content"),
        fbclid: queryParams.get("fbclid"),
    };

    localStorage.setItem("booking_source", JSON.stringify(trackingData));

    if (trackingData.fbclid && trackingData.utm_source) {
        localStorage.setItem("customer_source", JSON.stringify(trackingData));
    }

    localStorage.setItem("utm_source", queryParams.get("utm_source") || "None");
    localStorage.setItem("utm_medium", queryParams.get("utm_medium") || "None");
    localStorage.setItem("utm_campaign", queryParams.get("utm_campaign") || "None");
    localStorage.setItem("utm_content", queryParams.get("utm_content") || "None");

    if (fbclid) {
        localStorage.setItem("booking_origin", "facebook");
    } else if (ttclid) {
        localStorage.setItem("booking_origin", "tiktok");
    } else if (gclid) {
        localStorage.setItem("booking_origin", "google");
    } else {
        localStorage.setItem("booking_origin", "organic");
    }

    const squareLink: string = "https://book.squareup.com/appointments/ud9yhcwfqc1fg0/location/LY7BZ89WAQ2QS/services";
    const customize: boolean = true;

    let bookLink: string;
    const parts = location.pathname.split("/");
    if (parts[1] === "meta") {
        bookLink = `/meta/book/services`;
    } else {
        bookLink = "/book/services";
    }

    return (
        <section className="md:h-screen flex  flex-col justify-center items-start pt-24 relative z-10">
            <div className="w-full px-4 md:px-0 md:w-10/12 justify-center flex flex-col z-10 relative">
                <h3 className="text-4xl tracking-wider font-extrabold md:text-end md:flex md:self-end flex-col mb-8">
                    {/* FOLLOW US ON <br /> <span className="text-transparent bg-gradient-to-r from-[#4DFF20]  to-[#88FF7D] bg-clip-text">INSTAGRAM</span> */}
                </h3>
                <div className="hidden md:flex md:flex-row gap-2 h-full w-full overflow-hidden rounded-3xl ">
                    {instagram_images_desktop.map((image, index) => (
                        <div
                            key={index}
                            className={`h-[30em] md:h-[500px] ${
                                index === instagram_images_desktop.length - 1
                                    ? "w-[500px] hover:w-[500px]"
                                    : "w-3/12 hover:w-[400px] "
                            } aspect-[4/10] object-fill transition-all duration-500 brightness-50 scale-100 hover:brightness-100 rounded-3xl relative`}
                        >
                            <img
                                width={500}
                                height={500}
                                className="h-full w-full object-cover rounded-3xl"
                                src={image.image}
                                alt={`Instagram photo ${index + 1}`}
                            />
                            <p className="absolute bottom-4 text-center w-full font-bold  left-1/2 transform -translate-x-1/2 ">
                                {image.name}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col md:hidden gap-4 h-1/3 w-full z-20 bg-black">
                    {instagram_images_desktop.map((image, index) => (
                        <img
                            key={index}
                            width={500}
                            height={500}
                            className={`h-[10em]  ${
                                index === instagram_images_mobile.length - 1 ? "h-[300px]" : "h-2/12"
                            } aspect-[4/10] object-cover transition-all duration-500 brightness-50 scale-100 hover:brightness-100 hover:h-[300px] rounded-2xl`}
                            src={image.image}
                            alt={`Instagram photo ${index + 1}`}
                        />
                    ))}
                </div>
                <div className="flex flex-col md:flex-row  self-center gap-4 py-12 md:pl-[15vw] ">
                    <Button disabled={!bookEnabledParameter}>
                        {customize ? (
                            <Link to={bookLink}>{ctaTextParameter}</Link>
                        ) : (
                            <a href={squareLink}>{ctaTextParameter}</a>
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default InstagramSection;
