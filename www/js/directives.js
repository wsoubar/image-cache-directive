angular.module('starter.directives', [])

.directive('sasImageCache', ['$cordovaFileTransfer', function ($cordovaFileTransfer) {
    
    var diretiva = {};
    
    diretiva.restrict = 'A';

    diretiva.scope = {src: "@"};

    // diretiva.template = 'aqui será o link da imagem: '; // + {{ resultData }};

    diretiva.link = function(scope, element, attr) {

		scope.$on('img-download-completed', function (event, data) {
			console.log("#################### img-download-completed ######################");
			//attr.src = "https://upload.wikimedia.org/wikipedia/commons/0/00/IMG_2124_Everest.jpg";
			var fullpath = '';
			if (device.platform == 'Android') {
				fullpath = data.nativeURL;
			} else {
				fullpath = data.fullPath;
			}
			attr.$set('src', fullpath);
		});

		scope.$on('sas-found-localstorage', function (event, data) {
			console.log("#################### sas-found-localstorage ######################");
			var fullpath = '';
			if (device.platform == 'Android') {
				fullpath = data.result.nativeURL;
			} else {
				fullpath = data.result.fullPath;
			}
			attr.$set('src', "https://upload.wikimedia.org/wikipedia/commons/0/00/IMG_2124_Everest.jpg");
		});
    };


/*
"{
	"isFile":true, 
	"isDirectory":false,
	"name":"0709ae3b-0149-b34d-1970-bf7402d7370e.jpg",
	"fullPath":"/0709ae3b-0149-b34d-1970-bf7402d7370e.jpg",
	"filesystem":"<FileSystem: files-external>",
	"nativeURL":"file:///storage/emulated/0/Android/data/com.ionicframework.imgdirective798536/files/0709ae3b-0149-b34d-1970-bf7402d7370e.jpg"
}"
*/    

    diretiva.controller = ['$scope', '$attrs', '$cordovaFileTransfer', '$localStorage', '$filter',
    	function($scope, $attrs, $cordovaFileTransfer, $localStorage, $filter) {

    	if (!$localStorage.images) {
    		$localStorage.images = [];
    	}

	    var url = $scope.src; //$attrs.src;
	    var targetPath = cordova.file.externalDataDirectory + randomFilename(url);
	    var trustHosts = true
	    var options = {};

   		var found = $filter('filter')($localStorage.images, {url: url}, true);
   		//var found = [];
   		console.log("########### found ##########");
   		console.log(JSON.stringify(found));

   		if (found.length) {
	   		console.log("########### found [0] ##########");
	   		console.log(JSON.stringify(found[0].result));
			$scope.$emit('sas-found-localstorage', found[0]);	
			console.log("########### found [0] ---- ##########");
   		} else {
		    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
		      .then(function(result) {
		        // Success!
		        // DEPOIS COLOCAR PARA VERIFICAR SE ESTA NO IOS OU ANDROID (nativeURL / fullPath)
		        $localStorage.images.push({url: url, result: result});
		        console.log("########### gravado no localStorage ##########");
		 		$scope.$emit('img-download-completed', result);
		      }, function(err) {
		        // Error
		        console.log('download erro', err);
		      }, function (progress) {
		        // $timeout(function () {
		        //  $scope.downloadProgress = (progress.loaded / progress.total) * 100;
		        //})
		      });
   		}



    }];

    return diretiva;
}]);

function randomFilename (url) {
	return guid() +"." + getFilePathExtension(url);
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function getFilePathExtension(path) {
	var filename = path.split('\\').pop().split('/').pop();
	var lastIndex = filename.lastIndexOf(".");
	if (lastIndex < 1) return "";
	return filename.substr(lastIndex + 1);
}