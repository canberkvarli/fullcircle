import { useState, useEffect } from "react";

 function useFieldState(fieldName: string, currentFieldValue: any) {
    const OPTIONS = {
        gender: [
          { title: "Man", subtitle: "Radiate your masculine energy" },
          { title: "Woman", subtitle: "Embrace your feminine essence" },
          { title: "Non-binary" },
          { title: "Genderqueer" },
          { title: "Agender" },
          { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
          {
            title: "Other",
            subtitle: "Describe your unique path",
            input: true,
          },
        ],
        sexualOrientation: [
          "Straight",
          "Gay",
          "Lesbian",
          "Bisexual",
          "Asexual",
          "Demisexual",
          "Pansexual",
          "Queer",
          "Questioning",
        ],
        datePreferences: ["Men", "Women", "Everyone"],
        childrenPreference: [
          "Don’t have children",
          "Have children",
          "Open to children",
          "Want Children",
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
      };
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
    
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>(
    []
  );
  const [selectedDatePreferences, setSelectedDatePreferences] = useState<
    string[]
  >([]);
  const [selectedEducation, setSelectedEducation] = useState<string | null>(
    null
  );
  const [jobLocation, setJobLocation] = useState(currentFieldValue || "");
  const [jobTitle, setJobTitle] = useState(currentFieldValue || "");
  const [fullName, setFullName] = useState(currentFieldValue || "");
  const [customInput, setCustomInput] = useState("");
  const [selectedHeight, setSelectedHeight] = useState<number>(
    parseInt(currentFieldValue?.replace(/\D/g, "") ?? "130")
  );
  const [unit, setUnit] = useState<"cm" | "ft">(
    currentFieldValue?.includes("ft") ? "ft" : "cm"
  );

  useEffect(() => {
    if (fieldName === "height") {
      if (unit === "cm" && selectedHeight > 240) {
        setSelectedHeight(240);
      } else if (unit === "ft" && selectedHeight > 8) {
        setSelectedHeight(8);
      }
    }
  }, [unit]);

  useEffect(() => {
    if (fieldName === "gender") {
      if (OPTIONS.gender.some((option) => option.title === currentFieldValue)) {
        setSelectedGender(currentFieldValue);
        setCustomInput("");
      } else if (currentFieldValue) {
        setSelectedGender("Other");
        setCustomInput(currentFieldValue);
      }
    } else if (fieldName === "sexualOrientation") {
      setSelectedOrientations(Array.isArray(currentFieldValue) ? currentFieldValue : []);
    } else if (fieldName === "datePreferences") {
      setSelectedDatePreferences(Array.isArray(currentFieldValue) ? currentFieldValue : []);
    } else if (fieldName === "educationDegree") {
      setSelectedEducation(currentFieldValue || null);
    } else if (fieldName === "jobLocation") {
      setJobLocation(currentFieldValue || "");
    } else if (fieldName === "jobTitle") {
      setJobTitle(currentFieldValue || "");
    } else if (fieldName === "firstName") {
      setFirstName(currentFieldValue || "");
    } else if (fieldName === "lastName") {
      setLastName(currentFieldValue || "");
    }
  }, [fieldName, currentFieldValue]);

  const fieldConfig: Record<string, any> = {
    gender: {
      title: "Gender",
      options: OPTIONS.gender,
      selectedValue: selectedGender,
      onSelect: setSelectedGender,
      customInput: customInput,
      setCustomInput: setCustomInput,
    },
    sexualOrientation: {
      title: "Sexuality",
      options: OPTIONS.sexualOrientation,
      selectedValue: selectedOrientations,
      onSelect: (title: any) => {
        setSelectedOrientations((prev) =>
          prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
        );
      },
      clearAll: () => setSelectedOrientations([]),
    },
    datePreferences: {
      title: "Date Preference",
      options: OPTIONS.datePreferences,
      selectedValue: selectedDatePreferences,
      onSelect: (title: any) => {
        setSelectedDatePreferences((prev) =>
          prev.includes(title)
            ? prev.filter((item) => item !== title)
            : [...prev, title]
        );
      },
      clearAll: () => setSelectedDatePreferences([]),
    },
    childrenPreference: {
      title: "Children Preference",
      options: OPTIONS.childrenPreference,
      selectedValue: selectedDatePreferences,
      onSelect: (title: any) => {
        setSelectedDatePreferences((prev) =>
          prev.includes(title)
            ? prev.filter((item) => item !== title)
            : [...prev, title]
        );
      },
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
      unit,
      setUnit,
      setSelectedHeight,
    },
  };

  return {
    selectedGender, setSelectedGender,
    selectedOrientations, setSelectedOrientations,
    selectedDatePreferences, setSelectedDatePreferences,
    selectedEducation, setSelectedEducation,
    jobLocation, setJobLocation,
    jobTitle, setJobTitle,
    customInput, setCustomInput,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    fullName,
    setFullName,
    fieldConfig, OPTIONS,
    selectedHeight,
    setSelectedHeight,
    unit,
    setUnit,
  };
}

export default useFieldState;
