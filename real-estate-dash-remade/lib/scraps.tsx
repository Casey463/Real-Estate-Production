// useEffect(() => {
//   // Update markers based on active states

//   async function getData() {
//     if (activeStates.length > 0) {
//       const data = await zipData;
//       if (activeStates.includes("Washington")) {
//         const zipDataRecord = data as Record<string, string[]>;
//         setActiveZipCodes(zipDataRecord["wa_washington_zip_codes_geo.min"]);
//       }
//       if (activeStates.includes("Oregon")) {
//         const zipDataRecord = data as Record<string, string[]>;

//         setActiveZipCodes(zipDataRecord["wa_washington_zip_codes_geo.min"]);
//       }
//     }
//   }
//   getData();
// }, [activeStates, zipData]);
