import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const sessionToken = searchParams.get('sessiontoken');

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Check if Google Places API key is available
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (apiKey) {
      // Use real Google Places API
      const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=establishment|geocode&language=en&key=${apiKey}${sessionToken ? `&sessiontoken=${sessionToken}` : ''}`;
      
      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        const places = data.predictions.map((prediction: {
          place_id: string;
          description: string;
          structured_formatting: { main_text?: string };
          types?: string[];
        }) => ({
          place_id: prediction.place_id,
          name: prediction.structured_formatting.main_text || prediction.description,
          formatted_address: prediction.description,
          types: prediction.types || ['establishment'],
        }));

        return NextResponse.json({
          success: true,
          data: places,
        });
      } else {
        throw new Error(`Google Places API error: ${data.status}`);
      }
    } else {
      // Fallback to a free geocoding service (OpenStreetMap Nominatim)
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au,in,de,fr,es,it,jp,kr,sg,my,th,id,ph,vn,bd,pk,lk,np,bt,mv`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'Festos/1.0 (event-platform)',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Nominatim');
      }
      
      const data = await response.json();
      
      const places = data.map((result: {
        place_id?: number;
        osm_id?: number;
        display_name: string;
        type?: string;
        lat: string;
        lon: string;
      }) => ({
        place_id: result.place_id?.toString() || result.osm_id?.toString() || Math.random().toString(),
        name: result.display_name.split(',')[0],
        formatted_address: result.display_name,
        types: [result.type || 'establishment'],
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      }));

      return NextResponse.json({
        success: true,
        data: places,
        source: 'openstreetmap',
      });
    }
  } catch (error) {
    console.error('Places search error:', error);
    return NextResponse.json(
      { error: 'Failed to search places', message: 'An error occurred while searching for places' },
      { status: 500 }
    );
  }
}