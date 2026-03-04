import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var initialized = false;

  module Internship {
    public func compare(i1 : Internship, i2 : Internship) : Order.Order {
      switch (Text.compare(i1.company, i2.company)) {
        case (#equal) {
          Text.compare(i1.role, i2.role);
        };
        case (order) { order };
      };
    };
  };

  // Types
  public type Internship = {
    id : Text;
    company : Text;
    role : Text;
    domain : Text;
    skills : [Text];
    stipend : Nat;
    location : Text;
    deadline : Int;
    applyUrl : Text;
    source : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  type Bookmark = {
    bookmarkedAt : Int;
  };

  type Application = {
    appliedAt : Int;
  };

  // Stable storage
  let internships = Map.empty<Text, Internship>();
  let userBookmarks = Map.empty<Principal, Map.Map<Text, Bookmark>>();
  let userApplications = Map.empty<Principal, Map.Map<Text, Application>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Generate a unique ID using timestamp and a random number.
  func generateId() : Text {
    let timestamp = Time.now();
    let randomNumber = timestamp % 1000000;
    "id" # timestamp.toText() # randomNumber.toText();
  };

  // Helper for seeding sample internships
  func createSampleInternship(id : Text, company : Text, role : Text, domain : Text, skills : [Text], stipend : Nat, location : Text, deadlineDays : Int, source : Text) : Internship {
    let now = Time.now();
    let deadline = now + (deadlineDays * 24 * 60 * 60 * 1_000_000_000); // Convert days to nanoseconds

    {
      id;
      company;
      role;
      domain;
      skills;
      stipend;
      location;
      deadline;
      applyUrl = "https://apply." # company # ".com/" # role;
      source;
      createdAt = now;
    };
  };

  public shared ({ caller }) func initialize() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can initialize the system");
    };
    if (initialized) { return };
    initializeInternships();
    initialized := true;
  };

  func initializeInternships() {
    let seedData = [
      // Software Engineering (LinkedIn)
      ("SE001", "Tazt", "Software Engineer Intern", "Software Engineering", ["Java", "Spring Boot", "REST APIs"], 18000, "Remote", 25, "LinkedIn"),
      ("SE002", "Simya", "Frontend Developer Intern", "Software Engineering", ["React", "TypeScript", "UI/UX"], 14000, "Delhi", 20, "LinkedIn"),
      ("SE003", "Bricky", "DevOps Intern", "Software Engineering", ["AWS", "Docker", "CI/CD"], 14000, "Bangalore", 15, "LinkedIn"),
      // Marketing (Internshala)
      ("MK001", "Staary", "Content Writer Intern", "Marketing", ["Content Writing", "SEO", "Social Media"], 8500, "Remote", 16, "Internshala"),
      ("MK002", "Flocksy", "Digital Marketing Intern", "Marketing", ["Google Ads", "Analytics", "Copywriting"], 7500, "Mumbai", 10, "Internshala"),
      // Finance (LinkedIn)
      ("FN001", "Revizta", "Finance Analyst Intern", "Finance", ["Accounting", "Microsoft Excel", "Financial Modeling"], 12300, "Remote", 16, "LinkedIn"),
      ("FN002", "Scoreify", "Investment Banking Intern", "Finance", ["Investing", "Finance", "Excel"], 11300, "Chennai", 12, "LinkedIn"),
      // Design (Internshala)
      ("DS001", "Hybris", "Graphic Designer Intern", "Design", ["Canva", "Figma", "Illustration"], 6500, "Kolkata", 17, "Internshala"),
      ("DS002", "Procivils", "UI/UX Design Intern", "Design", ["UX", "Figma", "Wireframing"], 8200, "Remote", 13, "Internshala"),
      // Data Science (LinkedIn)
      ("DSC001", "FindRealty", "Data Analyst Intern", "Data Science", ["Python", "SAS", "Machine Learning"], 11000, "Bangalore", 20, "LinkedIn"),
      ("DSC002", "EatLab", "Machine Learning Intern", "Data Science", ["ML", "Python", "Scikit-learn"], 14000, "Mumbai", 13, "LinkedIn"),
      // Remote, unpaid + stipended mix (Internshala)
      ("RM001", "NFTShow", "Remote Engineering Intern", "Software Engineering", ["JavaScript", "Node.js", "APIs"], 0, "Remote", 9, "Internshala"),
      ("RM002", "Ecofy", "Research Intern", "Finance", ["Research", "Analysis", "Financial Modeling"], 4500, "Remote", 14, "Internshala"),
      // Uncommon domains (LinkedIn)
      ("HR001", "ItChooz", "HR/Recruiting Intern", "Human Resources", ["Recruiting", "Communication"], 6000, "Chennai", 12, "LinkedIn"),
      ("EDU001", "Integra", "Education Tech Intern", "Software Engineering", ["Python", "React", "Content Creation"], 9000, "Bangalore", 19, "LinkedIn"),
      // Closing within 7 days (Internshala)
      ("SR001", "MetaSmart", "Software Engineering Intern", "Software Engineering", ["C++", "Data Structures", "Algorithms"], 12000, "Delhi", 3, "Internshala"),
      ("BLR001", "Green AI", "Data Science Intern", "Data Science", ["Python", "Excel", "Machine Learning"], 13500, "Bangalore", 5, "Internshala")
    ];

    for (internshipData in seedData.values()) {
      let internship = createSampleInternship(
        internshipData.0,
        internshipData.1,
        internshipData.2,
        internshipData.3,
        internshipData.4,
        internshipData.5,
        internshipData.6,
        internshipData.7,
        internshipData.8,
      );
      internships.add(internship.id, internship);
    };
  };

  // Admin Panel APIs
  public shared ({ caller }) func addInternship(
    company : Text,
    role : Text,
    domain : Text,
    skills : [Text],
    stipend : Nat,
    location : Text,
    deadline : Int,
    applyUrl : Text,
    source : Text
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add internships");
    };

    let id = generateId();
    let internship : Internship = {
      id;
      company;
      role;
      domain;
      skills;
      stipend;
      location;
      deadline;
      applyUrl;
      source;
      createdAt = Time.now();
    };

    internships.add(id, internship);
    id;
  };

  public shared ({ caller }) func updateInternship(
    id : Text,
    company : Text,
    role : Text,
    domain : Text,
    skills : [Text],
    stipend : Nat,
    location : Text,
    deadline : Int,
    applyUrl : Text,
    source : Text
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update internships");
    };

    switch (internships.get(id)) {
      case (null) { Runtime.trap("Internship does not exist") };
      case (?existing) {
        let updated : Internship = {
          id = existing.id;
          company;
          role;
          domain;
          skills;
          stipend;
          location;
          deadline;
          applyUrl;
          source;
          createdAt = existing.createdAt;
        };
        internships.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteInternship(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete internships");
    };

    switch (internships.get(id)) {
      case (null) { Runtime.trap("Internship does not exist") };
      case (?_) {
        internships.remove(id);
      };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public actor interface
  public query ({ caller }) func getInternships() : async [Internship] {
    internships.values().toArray();
  };

  public query ({ caller }) func getInternshipById(id : Text) : async ?Internship {
    internships.get(id);
  };

  public shared ({ caller }) func addBookmark(internshipId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be an authenticated user to add bookmarks");
    };

    switch (internships.get(internshipId)) {
      case (null) { Runtime.trap("Internship does not exist") };
      case (?_) {
        let now = Time.now();
        let bookmark = { bookmarkedAt = now };
        let userBookmarksMap = switch (userBookmarks.get(caller)) {
          case (null) {
            let newMap = Map.empty<Text, Bookmark>();
            userBookmarks.add(caller, newMap);
            newMap;
          };
          case (?bm) { bm };
        };
        userBookmarksMap.add(internshipId, bookmark);
      };
    };
  };

  public shared ({ caller }) func removeBookmark(internshipId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be an authenticated user to remove bookmarks");
    };
    switch (userBookmarks.get(caller)) {
      case (null) { Runtime.trap("No bookmarks found for user") };
      case (?bm) {
        bm.remove(internshipId);
      };
    };
  };

  public query ({ caller }) func getBookmarks() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be an authenticated user to view bookmarks");
    };
    let bookmarks = switch (userBookmarks.get(caller)) {
      case (null) { Map.empty<Text, Bookmark>() };
      case (?bm) { bm };
    };
    bookmarks.keys().toArray();
  };

  public shared ({ caller }) func applyToInternship(internshipId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be an authenticated user to apply");
    };

    switch (internships.get(internshipId)) {
      case (null) { Runtime.trap("Internship does not exist") };
      case (?_) {
        let now = Time.now();
        let application = { appliedAt = now };
        let userApplicationsMap = switch (userApplications.get(caller)) {
          case (null) {
            let newMap = Map.empty<Text, Application>();
            userApplications.add(caller, newMap);
            newMap;
          };
          case (?apps) { apps };
        };
        userApplicationsMap.add(internshipId, application);
      };
    };
  };

  public query ({ caller }) func getApplications() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be an authenticated user to view applications");
    };
    let applications = switch (userApplications.get(caller)) {
      case (null) { Map.empty<Text, Application>() };
      case (?apps) { apps };
    };
    applications.keys().toArray();
  };

  public query ({ caller }) func getAlerts() : async [Internship] {
    let now = Time.now();
    let sevenDaysInNs : Int = 7 * 24 * 60 * 60 * 1_000_000_000;
    internships.values().toArray().filter(func(i) { i.deadline - now <= sevenDaysInNs });
  };
};
