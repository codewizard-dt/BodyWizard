<!DOCTYPE html>
<html>
    <head>

        <title>Head Space Acupuncture | Body, Mind, Spirit</title>

        <meta name="description" content="We are dedicated to eliminating physical pain and restoring function to your body." />
        <meta property="og:url" content="https://headspaceacupuncture.com/">
        <meta property="og:title" content="Head Space Acupuncture | Combining Meditation and Acupuncture">
        <meta property="og:description" content="We are dedicated to eliminating physical pain and restoring function to your body.">
        <meta property="og:image" content="http://headspaceacupuncture.com/images/opengraph/index.jpg">

        @include('layouts.header')

		<style>
			nav {
				height: 4em;
				background-image: -webkit-linear-gradient(rgb(190,190,190), rgb(220,220,220));
				background-image: -o-linear-gradient(rgb(190,190,190), rgb(220,220,220));
				background-image: linear-gradient(rgb(190,190,190), rgb(220,220,220));
				text-align: left;
			}
			nav .oldLogo {
				margin: 0.25em 1em;
				height:3.5em;
			}
			@keyframes crossover {
				0% {
					opacity: 0.5;
					left: calc(50% + 5em);
				}
				25% {
					opacity: 1;
					left:calc(50% - 1em);
				}
				50% {
					opacity: 0.5;
					left: calc(50% + 5em);
				}
				75% {
					opacity: 1;
					left: calc(50% + 11em);
				}
				100% {
					opacity: 0.5;
					left: calc(50% + 5em);
				}
			}			
			@keyframes spinOut {
				from {
					opacity:0.5;
/*					left: calc(50% + 5em);
*/					transform: scale(1) translateX(-50%);
				}
				to {
					opacity: 0;
					transform: scale(4) translateX(-50%) rotate(1080deg);
					left: calc(50% + 10em);
				}
			}
			@keyframes fadeInOut {
				from {opacity:1;}
				to {opacity:0;}
			}
			.logo, .oldlogo{
				position: absolute;
				margin: -5em;
				height:5em;
				width:5em;
				left: calc(50% + 5em);
				top: 5em;
				transform:translateX(-50%);
			}
			.logo{
				/*animation: crossover 4s linear 0s 1 normal;*/
				animation: fadeInOut 8s ease 0s 1 reverse;
			}
			.oldlogo {
				animation: fadeInOut 1s ease 0s 9 alternate;
				/*animation: crossover 4s linear 0s 1 reverse, spinOut 2s ease-in 4s;*/
				background-image: url('/images/logo/headspace-square.png');
				background-size: contain;
				height:5em;
				width:5em;
				opacity: 0;
			}
			.logoWarp{
				height:5em;
			}
		</style>
    </head>

    <body>

        <div class="navbar"></div>
        <nav>
			<a href="/"><img class="oldLogo" src="/images/logo/headspace-logo.png" alt="Head Space Acupuncture"></a>
        </nav>

        <div id='acu_chin_1' class='splash btnPopDown'>
            <div class="wrapper paddedBig">
            	<div class="logoWarp">
	                <div class='logo'></div>        		
	                <div class="oldlogo"></div>
            	</div>
                <h1>Head Space Acupuncture</h1>
                <h4 class='paddedSides caps letterStretch'>Is changing</h4>                
            </div>
            
            <a href='https://bodywizardmedicine.com'><div class='button pink'>find out more</div></a>
        </div>                
    </body>
</html>
