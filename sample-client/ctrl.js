app.controller("ctrl", function($scope, $stomp) {
    
    $scope.metrics = {};

    $scope.message = "TEST";


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

	$stomp
	    .connect('http://127.0.0.1:15674/stomp', { login: 'guest', passcode: 'guest'})
	 
	    // frame = CONNECTED headers 
	    .then(function (frame) {
	 
	        var subscription = $stomp.subscribe('/exchange/node-apm', function (payload, headers, res) {
	            $scope.payload = payload;


	            console.log(payload);

	            // $scope.$apply(function() {
	            	$scope.cookData(payload);
	            // });
	            // console.log(payload);
	            // document.getElementById('messages').value += payload + '\n';
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
	        // $stomp.disconnect(function () {
	 
	        // });
	    });


	
});