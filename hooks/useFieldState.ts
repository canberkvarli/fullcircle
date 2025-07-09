import { useState, useEffect, useMemo } from "react";

interface HiddenFields {
  [key: string]: boolean;
}

interface FieldConfig {
  title: string;
  options?: any;
  selectedValue?: any;
  onSelect?: (value: any) => void;
  customInput?: string;
  setCustomInput?: (value: string) => void;
  clearAll?: () => void;
  selectedHeight?: number;
  setSelectedHeight?: (value: number) => void;
}

function useFieldState(fieldName: string, currentFieldValue: any) {
  // Memoize OPTIONS so its reference doesn't change on every render.
  const OPTIONS: Record<string, any> = useMemo(
    () => ({
      gender: [
        { title: "Woman", subtitle: "Embrace your feminine essence" },
        { title: "Man", subtitle: "Radiate your masculine energy" },
        { title: "Trans Woman", subtitle: "Celebrate your authenticity" },
        { title: "Trans Man", subtitle: "Celebrate your authenticity" },
        { title: "Non-binary" },
        { title: "Genderqueer" },
        { title: "Agender" },
        { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
        { title: "Genderfluid", subtitle: "Embrace fluidity" },
        {
          title: "Other",
          subtitle: "Describe your unique path",
          input: true,
        },
      ],
      ConnectionPreferences: [
        "Men",
        "Women",
        "Non-binary",
        "Genderqueer",
        "Agender",
        "Genderfluid",
        "Trans Woman",
        "Trans Man",
        "Two-Spirit",
        "Bigender",
        "Intersex",
        "Everyone",
      ],
      educationDegree: [
        "High School",
        "Undergrad",
        "Postgrad",
        "Associate Degree",
        "Bachelor's Degree",
        "Master's Degree",
        "Doctorate",
        "Professional Certification",
      ],
      childrenPreference: [
        "Don’t have children",
        "Have children",
        "Open to children",
        "Want Children",
      ],
      ethnicities: [
        "American Indian",
        "East Asian",
        "Black/African Descent",
        "Middle Eastern",
        "Hispanic Latino",
        "South Asian",
        "Pacific Islander",
        "White/Caucasian",
      ],
      spiritualPractices: [
        "Hatha/Vinyasa Yoga",
        "Kundalini Yoga",
        "Yin Yoga",
        "Tantric Practices",
        "Mindfulness Meditation",
        "Breathwork",
        "Reiki (Energy Work)",
        "Chakra Healing",
        "Qi Gong",
        "Ayurveda",
        "Astrology (Western)",
        "Astrology (Vedic)",
        "Chinese Astrology",
        "Human Design & Numerology",
        "Tarot/Oracle Cards",
        "Cacao Ceremony",
        "Ayahuasca & Plant Medicine",
        "Sound Healing",
        "Ecstatic Dance",
        "Crystal Healing",
      ],
    }),
    []
  );

  // States for various fields
  const [firstName, setFirstName] = useState<string>(
    fieldName === "fullName" && currentFieldValue
      ? currentFieldValue.split(" ")[0]
      : currentFieldValue || ""
  );
  const [lastName, setLastName] = useState<string>(
    fieldName === "fullName" && currentFieldValue
      ? currentFieldValue.split(" ")[1] || ""
      : ""
  );
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>(
    []
  );
  const [selectedConnectionPreferences, setSelectedConnectionPreferences] = useState<
    string[]
  >([]);
  const [selectedEducation, setSelectedEducation] = useState<string | null>(
    null
  );
  const [jobLocation, setJobLocation] = useState(currentFieldValue || "");
  const [jobTitle, setJobTitle] = useState(currentFieldValue || "");
  const [selectedChildrenPreferences, setSelectedChildrenPreferences] =
    useState<any | null>(null);
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [selectedSpiritualPractices, setSelectedSpiritualPractices] = useState<
    string[]
  >([]);
  const [fullName, setFullName] = useState(currentFieldValue || "");
  const [customInput, setCustomInput] = useState<string>("");
  // Height is stored as a number in ft only.
  const [selectedHeight, setSelectedHeight] = useState<number>(
    typeof currentFieldValue === "string"
      ? parseInt(currentFieldValue.replace(/\D/g, "") || "0")
      : currentFieldValue || 0
  );
  const [location, setLocation] = useState(currentFieldValue || "");

  // Update field state on load.
  useEffect(() => {
    if (fieldName === "gender") {
      if (currentFieldValue) {
        const genders = Array.isArray(currentFieldValue)
          ? currentFieldValue
          : [currentFieldValue];
        setSelectedGender(genders);
        if (!genders.includes("Other")) {
          setCustomInput("");
        }
      }
    } else if (fieldName === "ConnectionPreferences") {
      // If stored value is "Open to All" or an array with only that value, convert to ["Everyone"] for the UI.
      if (typeof currentFieldValue === "string") {
        if (currentFieldValue === "Open to All") {
          setSelectedConnectionPreferences(["Everyone"]);
        } else {
          setSelectedConnectionPreferences([]);
        }
      } else if (Array.isArray(currentFieldValue)) {
        if (
          currentFieldValue.length === 0 ||
          (currentFieldValue.length === 1 &&
            currentFieldValue[0] === "Open to All")
        ) {
          setSelectedConnectionPreferences(["Everyone"]);
        } else {
          setSelectedConnectionPreferences(currentFieldValue);
        }
      } else {
        // Default to Everyone if no value exists.
        setSelectedConnectionPreferences(["Everyone"]);
      }
    } else if (fieldName === "educationDegree") {
      setSelectedEducation(currentFieldValue || null);
    } else if (fieldName === "ethnicities") {
      setSelectedEthnicities(
        Array.isArray(currentFieldValue) ? currentFieldValue : []
      );
    } else if (fieldName === "childrenPreference") {
      setSelectedChildrenPreferences(currentFieldValue || null);
    } else if (fieldName === "jobLocation") {
      setJobLocation(currentFieldValue || "");
    } else if (fieldName === "jobTitle") {
      setJobTitle(currentFieldValue || "");
    } else if (fieldName === "firstName") {
      setFirstName(currentFieldValue || "");
    } else if (fieldName === "lastName") {
      setLastName(currentFieldValue || "");
    } else if (fieldName === "location") {
      setLocation(currentFieldValue || "");
    } else if (fieldName === "spiritualPractices") {
      setSelectedSpiritualPractices(
        Array.isArray(currentFieldValue) ? currentFieldValue : []
      );
    }
  }, [fieldName, currentFieldValue]);

  const fieldConfig: Record<string, FieldConfig> = {
    gender: {
      title: "Gender",
      options: OPTIONS.gender,
      selectedValue: selectedGender,
      onSelect: setSelectedGender,
      customInput: customInput,
      setCustomInput: setCustomInput,
    },
    ConnectionPreferences: {
      title: "Date Preference",
      options: OPTIONS.ConnectionPreferences,
      selectedValue: selectedConnectionPreferences,
      onSelect: setSelectedConnectionPreferences,
      clearAll: () => setSelectedConnectionPreferences([]),
    },
    childrenPreference: {
      title: "Children Preference",
      options: OPTIONS.childrenPreference,
      selectedValue: selectedChildrenPreferences,
      onSelect: setSelectedChildrenPreferences,
    },
    educationDegree: {
      title: "Education",
      options: OPTIONS.educationDegree,
      selectedValue: selectedEducation,
      onSelect: setSelectedEducation,
    },
    jobLocation: {
      title: "Location",
      options: [],
      selectedValue: jobLocation,
      onSelect: setJobLocation,
    },
    jobTitle: {
      title: "Job Title",
      options: [],
      selectedValue: jobTitle,
      onSelect: setJobTitle,
    },
    firstName: {
      title: "<NAME>",
      options: [],
      selectedValue: firstName,
      onSelect: setFirstName,
    },
    lastName: {
      title: "<NAME>",
      options: [],
      selectedValue: lastName,
      onSelect: setLastName,
    },
    height: {
      title: "Height",
      selectedHeight,
      setSelectedHeight,
    },
    location: {
      title: "Location",
      selectedValue: location,
      onSelect: setLocation,
    },
    ethnicities: {
      title: "Ethnicities",
      options: OPTIONS.ethnicities,
      selectedValue: selectedEthnicities,
      onSelect: (title: string) => {
        setSelectedEthnicities((prev) =>
          prev.includes(title)
            ? prev.filter((item) => item !== title)
            : [...prev, title]
        );
      },
      clearAll: () => setSelectedEthnicities([]),
    },
    spiritualPractices: {
      title: "Spiritual Practices",
      options: OPTIONS.spiritualPractices,
      selectedValue: selectedSpiritualPractices,
      onSelect: (title: string) => {
        setSelectedSpiritualPractices((prev) =>
          prev.includes(title)
            ? prev.filter((item) => item !== title)
            : [...prev, title]
        );
      },
      clearAll: () => setSelectedSpiritualPractices([]),
    },
  };

  return {
    selectedGender,
    setSelectedGender,
    selectedOrientations,
    setSelectedOrientations,
    selectedConnectionPreferences,
    setSelectedConnectionPreferences,
    selectedEducation,
    setSelectedEducation,
    selectedEthnicities,
    setSelectedEthnicities,
    jobLocation,
    setJobLocation,
    jobTitle,
    setJobTitle,
    customInput,
    setCustomInput,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    fullName,
    setFullName,
    fieldConfig,
    OPTIONS,
    selectedHeight,
    setSelectedHeight,
    location,
    setLocation,
    selectedChildrenPreferences,
    setSelectedChildrenPreferences,
    selectedSpiritualPractices,
    setSelectedSpiritualPractices,
  };
}

export default useFieldState;
