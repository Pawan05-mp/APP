/**
 * Trixile Context-Aware Decision Engine
 * Core Logic for Filtering and Scoring
 */

// Haversine distance in KM
export const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const getTimeBucket = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return 'late_night';
    if (hour >= 17) return 'evening';
    return 'day';
};

export const getMOODS = (bucket) => {
    const allMoods = {
        quick_bite: { 
            id: 'quick_bite', emoji: '🍔', title: 'Quick Bite',
            filters: { type: ['quick_bite'], urgency: 0.9, effort: 0.2, energy: 0.5 }
        },
        chill: { 
            id: 'chill', emoji: '☕', title: 'Chill',
            filters: { type: ['quick_bite', 'establishment'], urgency: 0.3, effort: 0.3, energy: 0.2 }
        },
        peace: { 
            id: 'peace', emoji: '🛕', title: 'Peace',
            filters: { type: ['establishment'], urgency: 0.1, effort: 0.5, energy: 0.1 }
        },
        fun: { 
            id: 'fun', emoji: '🎮', title: 'Fun',
            filters: { type: ['establishment', 'social'], urgency: 0.5, effort: 0.4, energy: 0.9 }
        },
        walk: { 
            id: 'walk', emoji: '🚶', title: 'Walk',
            filters: { type: ['establishment'], urgency: 0.2, effort: 0.1, energy: 0.6 }
        }
    };

    switch (bucket) {
        case 'late_night':
            return [allMoods.quick_bite, allMoods.chill, allMoods.peace];
        case 'evening':
            return [allMoods.fun, allMoods.walk, allMoods.quick_bite];
        default:
            return [allMoods.walk, allMoods.chill, allMoods.fun];
    }
};

export const scorePlaces = (places, userLocation, moodFilters, excludedIds = [], isRelaxed = false) => {
    if (!userLocation) return [];

    let filtered = places.filter(p => !excludedIds.includes(p.id));
    
    // Initial Filter
    const maxDist = isRelaxed ? 15 : 5; // Expand to 15km if relaxed
    filtered = filtered.filter(p => {
        const dist = getDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
        return dist <= maxDist;
    });

    // Mood Filter (relax type constraint if no results)
    let typeFiltered = filtered.filter(p => moodFilters.type.includes(p.type));
    if (typeFiltered.length === 0 && !isRelaxed) {
        // RECURSIVE CALL: Relaxed mode
        return scorePlaces(places, userLocation, moodFilters, excludedIds, true);
    }
    
    const results = (typeFiltered.length > 0 ? typeFiltered : filtered)
        .map(p => {
            const distance = getDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
            
            const behavior_score = 
                (1 - Math.abs((p.urgency || 0.5) - moodFilters.urgency)) * 0.4 +
                (1 - Math.abs((p.effort || 0.5) - moodFilters.effort)) * 0.3 +
                (1 - Math.abs((p.energy || 0.5) - moodFilters.energy)) * 0.3;

            const distance_score = 1 - Math.min(distance / maxDist, 1);
            const final_score = (behavior_score * 0.7) + (distance_score * 0.3);

            const categoryMap = {
                quick_bite: 'quickbite',
                establishment: 'chill',
                social: 'social'
            };

            return {
                ...p,
                _id: p.id,
                category: categoryMap[p.type] || 'chill',
                distanceInKm: distance.toFixed(1),
                estimatedMinutes: Math.round(distance * 10 + 2),
                score: final_score,
                reason: getReason(p, moodFilters, isRelaxed),
                trustTag: getTrustTag(p),
                isFuzzyMatch: isRelaxed
            };
        })
        .sort((a, b) => b.score - a.score);

    return results;
};

const getTrustTag = (p) => {
    if (p.rating >= 4.7 && p.reviews > 1000) return "Local Legend";
    if (p.reviews > 500) return "Most Loved";
    if (p.rating >= 4.5) return "Pondy Favorite";
    return null;
};

const getReason = (p, mood, isRelaxed) => {
    if (isRelaxed) return "No exact match — closest strong fit.";
    if (p.urgency > 0.7 && mood.urgency > 0.7) return "Fastest option nearby.";
    if (p.energy > 0.7 && mood.energy > 0.7) return "High energy vibe for you.";
    if (p.effort < 0.3) return "Low effort, easy choice.";
    return "Perfect match for your vibe.";
};
