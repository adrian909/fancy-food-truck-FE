import { useEffect, useRef } from "react";

export default function GoogleMapDiv({ style, options = {}, onLoad, onIdle }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const onLoadRef = useRef(onLoad);
  const onIdleRef = useRef(onIdle);

  useEffect(() => { onLoadRef.current = onLoad; }, [onLoad]);
  useEffect(() => { onIdleRef.current = onIdle; }, [onIdle]);

  useEffect(() => {
    if (!divRef.current || !window.google?.maps || mapRef.current) return;

    const map = new window.google.maps.Map(divRef.current, {
      zoom: 16,
      center: { lat: 45.9572, lng: 23.5684 },
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      ...options,
    });

    mapRef.current = map;
    if (onLoadRef.current) onLoadRef.current(map);

    const idleListener = map.addListener("idle", () => {
      if (onIdleRef.current) onIdleRef.current();
    });

    return () => {
      window.google.maps.event.removeListener(idleListener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={divRef} style={style} />;
}
