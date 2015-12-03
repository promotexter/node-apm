app.controller("ctrl", function($scope, $stomp) {
    
    $scope.metrics = {};
    $scope.config = {
    	rabbit_server :'http://127.0.0.1:15674/stomp',
    	rabbit_server_options : {
    		 login: 'guest', 
    		 passcode: 'guest'
    	},
    	channel : '/exchange/node-apm',
    }

    $scope.message = "TEST";

    $scope.updateConfig = function(data)
    {
    	console.log("updateConfig");

    	$scope.config.rabbit_server = data.rabbit_server;
    	$scope.config.channel = data.channel;

    	// stopStomp(function(){
    		runStomp();
    	// })
    }

    $scope.cookData = function(data)
	{
		/*
			{
				source : 'localhost',
				type : 'app',
				body : {
					metric1 : {
						currentRate:
						count: 
					}
				}
			}
		*/
		// console.log(data);

			var key = data.source + "-" + data.type;

			// // is the source there?
			if(!$scope.metrics[key])
				$scope.metrics[key] = {};

			$scope.metrics[key].key = key;
			$scope.metrics[key].source = data.source;
			$scope.metrics[key].type = data.type;
			$scope.metrics[key].data = data.body;

			// console.log($scope.metrics);
			$scope.$apply();
	
	}

    $stomp.setDebug(function (args) {
	    document.getElementById('log').value += args + '\n';
	});

	runStomp();

    

    function runStomp()
    {
    	$scope.metrics = {};
    	
    	console.log("RUNNING STOMP");
    	// $stomp.disconnect(function () {
	    	$stomp
			    .connect($scope.config.rabbit_server, $scope.config.rabbit_server_options)
			 
			    // frame = CONNECTED headers 
			    .then(function (frame) {
			 		
			 		console.log("RUNNING STOMP [OK]");

			        var subscription = $stomp.subscribe($scope.config.channel, function (payload, headers, res) {
			            $scope.payload = payload;
		            	$scope.cookData(payload);
			            
			        }, {
			            "headers": "are awesome"
			        });
			 
			        // Unsubscribe 
			        // subscription.unsubscribe();
			 
			        // Send message 
			        // $stomp.send('/dest', {
			        //     message: 'body'
			        // }, {
			        //     priority: 9,
			        //     custom: 42 //Custom Headers 
			        // });
			 
			        // Disconnect 
			       
		    });
		// });
		
    }

   //  function stopStomp(cb)
   //  {
   //  	console.log("stopping STOMP");

   //  	 $stomp.disconnect(function () {

   //  	 	console.log("KILLED STOMP");
			// cb(); 
		 // });
   //  }	

	


	
});