var app = angular.module('testApp', ['ngRoute', 'angularUtils.directives.dirPagination', 'ngStorage']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'pages/home.html',
			controller  : 'homeController'
		})

		.when('/add', {
			templateUrl : 'pages/form.html',
			controller  : 'addController'
		})
		
		.when('/user/:id', {
			templateUrl : 'pages/details.html',
			controller  : 'detailsController'
		})

		.when('/edit/:id', {
			templateUrl : 'pages/form.html',
			controller  : 'editController'
		})
		
		.otherwise({
			templateUrl:'pages/404.html'});
});

// HOME ctrl
app.controller('homeController', function($scope, manageStorage){
	manageStorage.initDataSet();
	
	var users = manageStorage.getUsers();
	
	$scope.users = users;
});

// ADD ctrl
app.controller('addController', function($scope, manageStorage, $location) {
		
	$scope.title = "Unos";
	$scope.buttonTitle = "Dodaj";
	
	$scope.phones = [""];
	
	$scope.submit = function() {
		this.user.phones = $scope.phones;
		manageStorage.createUser(this.user);
		$location.path('/user/' + this.user.id);
    };

	$scope.add = function(){
    	$scope.phones.push("");
	};
	$scope.remove = function(index){
    	$scope.phones.splice(index, 1);
	};

});

//DETAILS ctrl
app.controller('detailsController', function($scope, $routeParams, manageStorage, $location, mergeService) {
	
	var userId = parseInt($routeParams.id);
	var user = manageStorage.getUserById(userId).user;
	$scope.user = user;
	
	if($scope.user == undefined)
		$location.path('/error');
	
	$scope.merged = [];
	var phones = [];
	
	var siblings = mergeService.getSiblings(userId);
	
	for(var i = 0 ; i< siblings.length ; i++){
		for(var j = 0 ; j < siblings[i].phones.length ; j++){
		/*
		var last=phones[phones.length-1]["number"];
		
		var newA = siblings[i].phones[j];
			
			if(phones[phones.length-1] == siblings[i].phones[j])
				console.log("isti");
		*/
			phones.push({'checked' : "", "number" : siblings[i].phones[j]});
		}
	}

	$scope.siblings = siblings;
	$scope.allPhones = phones;

	var btnDisabled = function(){
		return false;
	}
	
	$scope.btnDisabled = btnDisabled();
	
	$scope.merge = function (){
	
		var mergedUser = $scope.merged;
		var allPhones = $scope.allPhones;
		var selectedPhones = [];
		
		for(var i = 0; i < allPhones.length; i++){
			if(allPhones[i].checked == true)
				selectedPhones.push(allPhones[i].number)
		}

		newUser = {
			address: mergedUser.address, 
			city: mergedUser.city, 
			email: mergedUser.email, 
			firstName: user.firstName, 
			lastName: user.lastName, 
			phones: selectedPhones, 
			state: mergedUser.state, 
			zip: parseInt(mergedUser.zip)
		};

		for(var i = 0; i < siblings.length; i++){
			manageStorage.deleteUser(siblings[i].id);
		}

		manageStorage.createUser(newUser);
		$location.path('/user/' + newUser.id);
	}
	
	$scope.del = function(){
		manageStorage.deleteUser(userId);
		$location.path('/');
	}
	
	$scope.edit = function () {
	  $location.path( '/edit/'+ userId );
	};
});

// EDIT ctrl
app.controller('editController', function($scope,$routeParams, manageStorage, $location) {
	var userId = parseInt($routeParams.id);
	
	$scope.user = manageStorage.getUserById(userId).user;
	$scope.isEdit = true;
	
	if($scope.user == undefined)
		$location.path('/error');
	
	$scope.phones = $scope.user.phones;
	
	$scope.title = "Uređivanje";
	$scope.buttonTitle = "Spremi";

	$scope.submit = function() {
		this.user.phones = $scope.phones;
		manageStorage.updateUser(this.user);
		$location.path('/user/' + userId);
    };
	
	$scope.add = function(){
    	$scope.phones.push("");
	};
	
	$scope.remove = function(index){
    	$scope.phones.splice(index, 1);
	};
});

// SRORAGE service
app.service('manageStorage', function($localStorage){
	var storage = $localStorage;

	var initDataSet = function(){
		if (!storage.data){
			var json = [], i;
			var fnames = ['Barack', 'Chuck', 'Kim', "Arnold", "Forrest"];
			var lnames = ['Kardashian','Obama','Norris','Schwarzenegger', "Gump"];
			var places = ['Neverland', 'Gotham City', 'El Dorado', 'Springfield', 'Zion'];
			var states = ['Gondor', 'Corto Maltese', 'Freedonia']
			for (i=0 ; i < 2 ; i++) {
				var fname = fnames[Math.floor(Math.random() * fnames.length)];
				var lname = lnames[Math.floor(Math.random() * lnames.length)];
				var place = places[Math.floor(Math.random() * places.length)];
				var state = states[Math.floor(Math.random() * states.length)];

				var phones = [], k;
				for (k = 1 ; k < 4 ; k++) {
					phones.push( k * 11111);
				}

				json.push({id: i, address: "Ulica " + place + " 8" + i, city: place, email: lname.toLowerCase() + "." + fname.toLowerCase() + "@test.te", firstName: fname, lastName: lname, phones: phones, state: state, zip: 9999 });
			}
			storage.id = i - 1;
			storage.data = angular.toJson(json);
		}
	}
	
	var getUsers = function (){	
		return angular.fromJson(storage.data);
	}
	
	var getUserById = function (id){

		var user, index;
		var data = getUsers();

		for (index = 0; index < data.length; index++){
		  if (data[index].id == id){
			  user = data[index];
			  break;
		  }
		}
		
		return {
			user : user, 
			index : index
		};
	}
	
	var getNewId = function (){	
		var id = angular.fromJson(storage.id) + 1;
		storage.id = id;
		return id;
	}
	
	var setUsers = function (users){
		storage.data = angular.toJson(users);
	}
	
	var createUser = function(user){
		user.id = getNewId();
		var data = getUsers();
		data.push(user);
		setUsers(data);
	}
	
	var deleteUser = function(userId){
		var data = getUsers();
		var userIndex = getUserById(userId).index;
		data.splice(userIndex, 1);
		setUsers(data);
	}
	
	var updateUser = function (newUser){
		var uid = newUser.id;
		deleteUser(uid);
		
		var data = getUsers();
		data.push(newUser);
		setUsers(data);
	}
		
	return {
		initDataSet : initDataSet,
		getUsers : getUsers,
		getUserById : getUserById,
		createUser : createUser,
		updateUser : updateUser,
		deleteUser : deleteUser
	}
});

// MERGE service
app.service('mergeService', function(manageStorage){
	
	var getSiblings = function (userId){
		var siblingUsers = [];
		var user = manageStorage.getUserById(userId).user;
		var data = manageStorage.getUsers();

		for (index = 0; index < data.length; index++){
		  if (data[index].firstName == user.firstName && data[index].lastName == user.lastName){
			  siblingUsers.push(data[index]);
		  }
		}
		return siblingUsers;
	}

	return{
			getSiblings : getSiblings
		}
	
	
});

