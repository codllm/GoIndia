import React from "react";
import { MapPin } from "lucide-react";
import { RidingContext } from "../context/ridingDataContext";

const LocationSearchPanel = ({
  suggestions,
  activeField,
  setPickup,
  setDestination,
  setPickupInput,
  setDestinationInput,
}) => {

  const { rideData, SetrideData } = React.useContext(RidingContext);

  // SAFE display
  const getDisplayText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    return (
      item.description ||
      item.name ||
      item.place_name ||
      item.display_name ||
      ""
    );
  };

  return (
    <div className="w-full bg-white px-4 py-3">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">
        Suggested locations
      </h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">

        {suggestions?.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-6">
            Start typing to see suggestions
          </div>
        )}

        {suggestions?.map((item, index) => (

          <div
            key={index}
            onClick={() => {

  
              const formatted = {
                ...item,
                location: item.coordinates
                  ? {
                      lat: item.coordinates[1],
                      lng: item.coordinates[0],
                    }
                  : null,
              };

              if (activeField === "pickup") {
                setPickup(formatted);
                setPickupInput(getDisplayText(item));
              } else {
                setDestination(formatted);
                setDestinationInput(getDisplayText(item));
              }
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >

            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <MapPin size={18} />
            </div>

            <span className="text-sm text-gray-900">
              {getDisplayText(item)}
            </span>

          </div>

        ))}
      </div>
    </div>
  );
};

export default LocationSearchPanel;