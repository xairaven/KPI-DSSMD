//! Great-circle distance between two coordinates, used to rank candidate
//! institutions by how close they are to the device's current location.

const EARTH_RADIUS_KM: f64 = 6371.0;

#[allow(
    clippy::suboptimal_flops,
    reason = "Kept in standard textbook haversine form for readability"
)]
pub fn haversine_km(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let (lat1, lon1, lat2, lon2) = (
        lat1.to_radians(),
        lon1.to_radians(),
        lat2.to_radians(),
        lon2.to_radians(),
    );

    let d_lat = lat2 - lat1;
    let d_lon = lon2 - lon1;

    let a = (d_lat / 2.0).sin().powi(2)
        + lat1.cos() * lat2.cos() * (d_lon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().asin();

    EARTH_RADIUS_KM * c
}

#[cfg(test)]
mod tests {
    use super::haversine_km;

    #[test]
    fn same_point_is_zero_distance() {
        assert_eq!(haversine_km(50.4547, 30.4467, 50.4547, 30.4467), 0.0);
    }

    #[test]
    fn kyiv_to_lviv_is_roughly_correct() {
        let distance = haversine_km(50.4547, 30.4467, 49.8389, 24.0243);
        assert!(
            (455.0..=470.0).contains(&distance),
            "expected ~455-470 km, got {distance}"
        );
    }
}
