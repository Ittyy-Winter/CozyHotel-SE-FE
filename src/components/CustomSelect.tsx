"use client";
import Select from "react-select";

export interface HotelOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    hotels: HotelOption[];
    selectedHotels: string[];
    onChange: (selected: string[]) => void;
}

export default function CustomSelect({ hotels, selectedHotels, onChange }: CustomSelectProps) {
    const handleChange = (selected: HotelOption[] | null) => {
        if (selected) {
            onChange(selected.map((item) => item.value));
        } else {
            onChange([]);
        }
    };

    return (
        <Select
            isMulti
            options={hotels}
            value={hotels.filter(hotel => selectedHotels.includes(hotel.value))}
            onChange={(selected) => handleChange(selected as HotelOption[])}
            className="select2-container text-black dark:text-white w-full rounded border border-[#333] bg-[#1A1A1A] p-2 placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
            classNamePrefix="select2"
            placeholder="Select hotels..."
            theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                    ...theme.colors
                },
            })}
        />
    );
}
