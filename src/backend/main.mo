import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";

actor {
  // Emergency Contact Type
  type Contact = {
    name : Text;
    phoneNumber : Text;
    relationship : Text;
  };

  // Marker Type
  public type MarkerType = {
    #safe;
    #danger;
    #waypoint;
  };

  type Marker = {
    lat : Float;
    lng : Float;
    title : Text;
    markerType : MarkerType;
    notes : Text;
    timestamp : Int;
  };

  // User Settings
  type Settings = {
    sosMessage : Text;
  };

  // Marker ID Type
  module MarkerId {
    public func compare(n1 : MarkerId, n2 : MarkerId) : Order.Order {
      Int.compare(n1, n2);
    };
  };
  type MarkerId = Int;

  // Persistent Data Structures
  var nextMarkerId = 0;
  var settings : Settings = {
    sosMessage = "This is my default SOS message.";
  };

  let contacts = Map.empty<Text, Contact>();
  let markers = Map.empty<MarkerId, Marker>();

  // Contacts CRUD
  public shared ({ caller }) func addContact(name : Text, phoneNumber : Text, relationship : Text) : async () {
    let contact : Contact = {
      name;
      phoneNumber;
      relationship;
    };
    contacts.add(name, contact);
  };

  public shared ({ caller }) func updateContact(name : Text, newPhoneNumber : Text, newRelationship : Text) : async () {
    switch (contacts.get(name)) {
      case (null) { Runtime.trap("Contact does not exist") };
      case (?_) {
        let updatedContact : Contact = {
          name;
          phoneNumber = newPhoneNumber;
          relationship = newRelationship;
        };
        contacts.add(name, updatedContact);
      };
    };
  };

  public shared ({ caller }) func deleteContact(name : Text) : async () {
    if (not contacts.containsKey(name)) { Runtime.trap("Contact does not exist") };
    contacts.remove(name);
  };

  public query ({ caller }) func getContact(name : Text) : async Contact {
    switch (contacts.get(name)) {
      case (null) { Runtime.trap("Contact does not exist") };
      case (?contact) { contact };
    };
  };

  public query ({ caller }) func getAllContacts() : async [Contact] {
    contacts.values().toArray();
  };

  // Markers CRUD
  public shared ({ caller }) func addMarker(lat : Float, lng : Float, title : Text, markerType : MarkerType, notes : Text) : async MarkerId {
    let id = nextMarkerId;
    nextMarkerId += 1;

    let marker : Marker = {
      lat;
      lng;
      title;
      markerType;
      notes;
      timestamp = Time.now();
    };
    markers.add(id, marker);
    id;
  };

  public shared ({ caller }) func updateMarker(id : MarkerId, lat : Float, lng : Float, title : Text, markerType : MarkerType, notes : Text) : async () {
    switch (markers.get(id)) {
      case (null) { Runtime.trap("Marker does not exist") };
      case (?_) {
        let updatedMarker : Marker = {
          lat;
          lng;
          title;
          markerType;
          notes;
          timestamp = Time.now();
        };
        markers.add(id, updatedMarker);
      };
    };
  };

  public shared ({ caller }) func deleteMarker(id : MarkerId) : async () {
    if (not markers.containsKey(id)) { Runtime.trap("Marker does not exist") };
    markers.remove(id);
  };

  public query ({ caller }) func getMarker(id : MarkerId) : async Marker {
    switch (markers.get(id)) {
      case (null) { Runtime.trap("Marker does not exist") };
      case (?marker) { marker };
    };
  };

  public query ({ caller }) func getAllMarkers() : async [Marker] {
    markers.values().toArray();
  };

  // Compare function for MarkerId type
  public query ({ caller }) func getAllMarkerIds() : async [MarkerId] {
    markers.keys().toArray().sort();
  };

  public query ({ caller }) func getMarkersByType(markerType : MarkerType) : async [Marker] {
    markers.values().toArray().filter(
      func(marker) { marker.markerType == markerType }
    );
  };

  // Settings CRUD
  public shared ({ caller }) func updateSOSMessage(newMessage : Text) : async () {
    let newSettings : Settings = {
      sosMessage = newMessage;
    };
    settings := newSettings;
  };

  public query ({ caller }) func getSOSMessage() : async Text {
    settings.sosMessage;
  };

  public query ({ caller }) func getAllData() : async {
    contacts : [Contact];
    markers : [Marker];
    sosMessage : Text;
  } {
    {
      contacts = contacts.values().toArray();
      markers = markers.values().toArray();
      sosMessage = settings.sosMessage;
    };
  };
};
