import HotelCatalog from "@/components/HotelCatalog";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";

export default function HotelPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="luxury-section">
        <div className="luxury-card p-8">
          <Suspense 
            fallback={
              <div className="py-12 text-center">
                <p className="text-[#C9A55C] text-lg font-serif mb-6">Finding the perfect hotels for you...</p>
                <LinearProgress sx={{ 
                  maxWidth: '400px', 
                  margin: '0 auto',
                  backgroundColor: 'rgba(201, 165, 92, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#C9A55C'
                  }
                }}/>
              </div>
            }
          >
            <HotelCatalog />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
