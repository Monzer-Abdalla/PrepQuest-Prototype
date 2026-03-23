import { collection, getDocs } from "firebase/firestore";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Region } from "react-native-maps";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadow,
} from "../../src/constants/theme";
import { db } from "../../src/services/firebase";
import { fetchMedicalPlaces, MedicalPlace } from "../../src/services/geoapifyService";

type ResourceType = "Shelter" | "Medical" | "Supply" | "Other";

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  latitude: number;
  longitude: number;
  contact?: string;
  hours?: string;
  capacity?: number;
  address?: string;
  subCategory?: string;
  source?: "firestore" | "geoapify";
}

const TYPE_COLORS: Record<ResourceType, string> = {
  Shelter: Colors.secondary.main,
  Medical: Colors.semantic.error,
  Supply: Colors.primary.main,
  Other: Colors.neutral.textSecondary,
};

const CAIRO_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

const FILTER_TYPES: Array<ResourceType | "All"> = [
  "All",
  "Shelter",
  "Medical",
  "Supply",
];

interface UserCoords {
  latitude: number;
  longitude: number;
}

function haversineKm(a: UserCoords, b: UserCoords): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function medicalPlaceToResource(p: MedicalPlace): Resource {
  return {
    id: p.id,
    name: p.name,
    type: "Medical",
    latitude: p.latitude,
    longitude: p.longitude,
    contact: p.phone !== "" ? p.phone : undefined,
    address: p.address !== "" ? p.address : undefined,
    subCategory: p.category,
    source: "geoapify",
  };
}

export default function MapScreen() {
  const [firestoreResources, setFirestoreResources] = useState<Resource[]>([]);
  const [geoResources, setGeoResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filter, setFilter] = useState<ResourceType | "All">("All");
  const [selected, setSelected] = useState<Resource | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const mapRef = useRef<MapView>(null);
  const geoFetchedRef = useRef(false);

  useEffect(function() {
    getDocs(collection(db, "resources")).then(function(snap) {
      const data: Resource[] = snap.docs.map(function(docSnap) {
        const d = docSnap.data();
        const gp = d.location;
        return {
          id: docSnap.id,
          name: d.name,
          type: d.type as ResourceType,
          latitude: gp.latitude,
          longitude: gp.longitude,
          contact: d.contact,
          hours: d.hours,
          capacity: d.capacity,
          source: "firestore",
        };
      });
      setFirestoreResources(data);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  useEffect(function() {
    Location.requestForegroundPermissionsAsync().then(function(result) {
      if (result.status !== "granted") { return; }
      return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    }).then(function(loc) {
      if (!loc) { return; }
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserCoords(coords);
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          { ...coords, latitudeDelta: 0.18, longitudeDelta: 0.18 },
          800
        );
      }
    }).catch(function() {});
  }, []);

  useEffect(function() {
    if (filter !== "Medical") { return; }
    if (geoFetchedRef.current) { return; }
    geoFetchedRef.current = true;
    setGeoLoading(true);
    fetchMedicalPlaces(CAIRO_REGION.latitude, CAIRO_REGION.longitude).then(function(places) {
      if (places.length === 0) { geoFetchedRef.current = false; }
      setGeoResources(places.map(medicalPlaceToResource));
      setGeoLoading(false);
    });
  }, [filter, userCoords]);

  const firestoreMedicalIds = new Set(
    firestoreResources.filter(function(r) { return r.type === "Medical"; }).map(function(r) { return r.id; })
  );

  const allMedical: Resource[] = firestoreResources
    .filter(function(r) { return r.type === "Medical"; })
    .concat(geoResources.filter(function(r) { return firestoreMedicalIds.has(r.id) === false; }));

  let visible: Resource[];
  if (filter === "All") {
    const nonMedical = firestoreResources.filter(function(r) { return r.type !== "Medical"; });
    visible = nonMedical.concat(allMedical);
  } else if (filter === "Medical") {
    visible = allMedical;
  } else {
    visible = firestoreResources.filter(function(r) { return r.type === filter; });
  }

  const recenter = function() {
    if (mapRef.current) { mapRef.current.animateToRegion(CAIRO_REGION, 600); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading resources…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.main} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Resources</Text>
        <Text style={styles.headerSub}>
          Cairo — {visible.length} locations
          {filter === "Medical" && geoLoading ? "  (fetching live data…)" : ""}
          {filter === "Medical" && !geoLoading && geoResources.length > 0
            ? "  · " + geoResources.length + " live"
            : ""}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {FILTER_TYPES.map(function(t) {
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.filterChip,
                filter === t && {
                  backgroundColor: t === "All" ? Colors.primary.main : TYPE_COLORS[t as ResourceType],
                  borderColor: t === "All" ? Colors.primary.main : TYPE_COLORS[t as ResourceType],
                },
              ]}
              onPress={function() {
                setFilter(t);
                setSelected(null);
              }}
              activeOpacity={0.75}
            >
              {t !== "All" && (
                <View style={[
                  styles.filterDot,
                  { backgroundColor: filter === t ? 'rgba(255,255,255,0.8)' : TYPE_COLORS[t as ResourceType] }
                ]} />
              )}
              <Text style={[styles.filterText, filter === t && { color: "#fff" }]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filter === "Medical" && geoLoading && (
        <View style={styles.geoLoadingBar}>
          <ActivityIndicator size="small" color={Colors.semantic.error} />
          <Text style={styles.geoLoadingText}>Fetching nearby hospitals & pharmacies…</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={CAIRO_REGION}
          showsUserLocation
          showsCompass
          onPress={function() { setSelected(null); }}
        >
          {visible.map(function(r) {
            return (
              <Marker
                key={r.id}
                coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                pinColor={TYPE_COLORS[r.type] ?? Colors.neutral.textSecondary}
                onPress={function(e) {
                  e.stopPropagation();
                  setSelected(r);
                }}
              />
            );
          })}
        </MapView>

        {selected !== null && (
          <View style={[styles.infoCard, { borderLeftColor: TYPE_COLORS[selected.type] }]}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.calloutName}>{selected.name}</Text>
              <View style={styles.infoCardHeaderRight}>
                {selected.source === "geoapify" && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>🌐 Live</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={function() { setSelected(null); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.dismissBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.calloutType, { color: TYPE_COLORS[selected.type] }]}>
              {selected.subCategory !== undefined ? selected.subCategory : selected.type}
            </Text>

            {userCoords !== null && (
              <Text style={styles.distanceText}>
                📍 {haversineKm(userCoords, selected).toFixed(1)} km away
              </Text>
            )}

            {selected.address !== undefined && (
              <Text style={styles.calloutDetail}>📌 {selected.address}</Text>
            )}

            {selected.hours !== undefined && (
              <Text style={styles.calloutDetail}>🕐 {selected.hours}</Text>
            )}

            {selected.contact !== undefined && (
              <Text style={styles.calloutDetail}>📞 {selected.contact}</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.recenterBtn} onPress={recenter} activeOpacity={0.8}>
          <Text style={styles.recenterText}>⊕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        {(["Shelter", "Medical", "Supply"] as ResourceType[]).map(function(t) {
          return (
            <View key={t} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[t] }]} />
              <Text style={styles.legendLabel}>{t}</Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.background,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 15,
    color: Colors.neutral.textSecondary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "500",
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    backgroundColor: Colors.neutral.surface,
    gap: 5,
  },
  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.neutral.textSecondary,
  },
  geoLoadingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: "#FFF5F5",
    borderBottomWidth: 1,
    borderBottomColor: Colors.semantic.error + "30",
  },
  geoLoadingText: {
    fontSize: 12,
    color: Colors.semantic.error,
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  recenterBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.md,
  },
  recenterText: {
    fontSize: 22,
    color: Colors.primary.main,
  },
  infoCard: {
    position: "absolute",
    bottom: 70,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.neutral.border,
    ...Shadow.md,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  infoCardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  liveBadge: {
    backgroundColor: Colors.semantic.error + "15",
    borderWidth: 1,
    borderColor: Colors.semantic.error + "40",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.semantic.error,
  },
  dismissBtn: {
    fontSize: 16,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
  calloutName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.neutral.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  calloutType: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.secondary.main,
    marginBottom: 4,
  },
  calloutDetail: {
    fontSize: 12,
    color: Colors.neutral.textSecondary,
    marginTop: 3,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: Colors.neutral.textSecondary,
    fontWeight: "500",
  },
});
