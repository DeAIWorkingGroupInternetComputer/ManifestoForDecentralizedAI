import HashMap "mo:base/HashMap";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor {
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

// Manifesto Signatures from Website
  public type ManifestoSignee = {
    name: Text;
    emailAddress: Text;
    signedAt: Nat64;
    title: ?Text;
    organization: ?Text;
  };

  public type SignUpFormInput = {
    name: Text;
    emailAddress: Text;
    title: ?Text;
    organization: ?Text;
  };

  stable var signeesStorageStable : [(Text, ManifestoSignee)] = [];
  var signeesStorage : HashMap.HashMap<Text, ManifestoSignee> = HashMap.HashMap(0, Text.equal, Text.hash);

  private func putManifestoSignee(signee : ManifestoSignee) : Text {
    signeesStorage.put(signee.emailAddress, signee);
    return signee.emailAddress;
  };

  private func getManifestoSignee(emailAddress : Text) : ?ManifestoSignee {
    let result = signeesStorage.get(emailAddress);
    return result;
  };

  public func submit_signup_form(submittedSignUpForm : SignUpFormInput) : async Text {
    if (submittedSignUpForm.name.size() > 40 or submittedSignUpForm.emailAddress.size() > 40) {
      return "Wrong input. Please correct it.";
    };
    switch(getManifestoSignee(submittedSignUpForm.emailAddress)) {
      case null {
        // New signee
        let newSignee : ManifestoSignee = {
          emailAddress: Text = submittedSignUpForm.emailAddress;
          name: Text = submittedSignUpForm.name;
          signedAt: Nat64 = Nat64.fromNat(Int.abs(Time.now()));
          title: ?Text = submittedSignUpForm.title;
          organization: ?Text = submittedSignUpForm.organization;
        };
        let result = putManifestoSignee(newSignee);
        if (result != newSignee.emailAddress) {
          return "There was an error. Please try again.";
        };
        return "Successfully signed!";
      };
      case _ { return "Already signed!"; };
    };  
  };

  // Function to get all individual signee names
  public query func get_manifesto_signee_names() : async [Text] {
    // Filter out all info besides signee name
    var signeeNames : [Text] = Array.map(Iter.toArray(signeesStorage.vals()), func (signee : ManifestoSignee) : Text {
      if (signee.name.size() <= 40) {
        return signee.name;
      };
      return "";  
    });
    signeeNames := Array.filter(signeeNames, func (signeeName : Text) : Bool {
      if (signeeName == "") {
        return false;
      };
      return true;  
    });
    return signeeNames;
  };

  // Function for custodian to get all individual signees
  public shared query ({ caller }) func get_manifesto_signees() : async [(Text, ManifestoSignee)] {
    // don't allow anonymous Principal
    if (Principal.isAnonymous(caller)) {
      return [];
		};
    // Only Principals registered as custodians can access this function
    if (Principal.isController(caller)) {
      return Iter.toArray(signeesStorage.entries());
    };
    return [];
  };

  // Function for custodian to get the number of individual signees
  public shared query ({ caller }) func get_number_of_manifesto_signees() : async Int {
    // don't allow anonymous Principal
    if (Principal.isAnonymous(caller)) {
      return 0;
		};
    // Only Principals registered as custodians can access this function
    if (Principal.isController(caller)) {
      return Iter.toArray(signeesStorage.entries()).size();
    };
    return 0;
  };

  // Function for custodian to delete an individual signee
  public shared({ caller }) func delete_manifesto_signee(emailAddress : Text) : async Bool {
    // don't allow anonymous Principal
    if (Principal.isAnonymous(caller)) {
      return false;
		};
    // Only Principals registered as custodians can access this function
    if (Principal.isController(caller)) {
      signeesStorage.delete(emailAddress);
      return true;
    };
    return false;
  };

// Upgrade Hooks
  system func preupgrade() {
    signeesStorageStable := Iter.toArray(signeesStorage.entries());
  };

  system func postupgrade() {
    signeesStorage := HashMap.fromIter(Iter.fromArray(signeesStorageStable), signeesStorageStable.size(), Text.equal, Text.hash);
    signeesStorageStable := [];
  };
};
