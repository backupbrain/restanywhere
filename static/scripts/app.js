import Alert from './components/Alert.vue.js';

document.addEventListener("DOMContentLoaded", () => {
	app = new Vue({
		el: '#app',
		data: {
			docUrl: null,
			queryParameters: {
				QUERY: 'q',
			},
			alerts: {
				permalinkSuccess: { type: 'success', message: 'Copied permalink to clipboard' },
				howToBookmark: { type: 'warning', message: 'You can add this page to your bookmarks by pressing ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D on your keyboard.' },
			},
			isWorking: false,
		},
		components: {
			'alert': Alert,
		},
		watch: {
			windowHeight(newHeight, oldHeight) {
				var text = `it changed to ${newHeight} from ${oldHeight}`;
				//console.log(text);
				this.screen.height = newHeight;
			},
			windowWidth(newWidth, oldWidth) {
				this.screen.width = newWidth;
			},
		},
		created() {
			this.docUrl = this.getUrlParameter(this.queryParameters.QUERY);
		},
		mounted() {
			if ((this.docUrl != null) && (this.docUrl != "")) {
				this.loadNewUrl();
			}
		},
		computed: {
			docTitle() {
				return document.getElementById("docWindow").contentDocument.title;
			},
			isValidLink() {
				var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
				var regex = new RegExp(expression);
				return ((this.docUrl != null) && (this.docUrl != "") && this.docUrl.match(expression));
			}
		},
		methods: {
			loadNewUrl() {
				var self = this;
				this.isWorking = true;

				var queryParameters = {};
				queryParameters[this.queryParameters.QUERY] = this.docUrl;
				history.pushState(
					queryParameters,
					document.title,
					"?" + this.queryParameters.QUERY + "=" + this.docUrl
				);
				document.getElementById('docWindow').onload = function() {
					self.isWorking = false;
					console.log("loaded");
				};
				document.getElementById('docWindow').src = "docviewer.html?q=" + this.docUrl;
				console.log("setting docUrl to " + this.docUrl);
			},
			notify(id) {
				var alertId = `alert_${id}`;
				this.$refs[alertId][0].show();
			},
			openHelp() {
				this.docUrl = null;
				var queryParameters = {};
				queryParameters[this.queryParameters.QUERY] = null;
				history.pushState(
					queryParameters,
					document.title,
					"?q="
				);
				document.getElementById('docWindow').src = "intro.html";
			},
			copyPermalink() {
				var baseUrl = window.location.origin + window.location.pathname;
				var params = {}
				params[this.queryParameters.QUERY] = this.docUrl;
				var queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
				var output = `${baseUrl}?${queryString}`;

				this.writeText(output)
				.then(text => {
					this.notify('permalinkSuccess');
				})
				.catch(error => {
					this.notify('copyFail');
				})
				return output;
			},
			bookmark() {
				//var iframeTitle = document.getElementById("docWindow").contentDocument.title;
				
				if (window.sidebar && window.sidebar.addPanel) { // Firefox <23
					window.sidebar.addPanel(document.title,window.location.href,'');
				} else if(window.external && ('AddFavorite' in window.external)) { // Internet Explorer
					window.external.AddFavorite(location.href,document.title); 
				} else if(window.opera && window.print || window.sidebar && ! (window.sidebar instanceof Node)) { // Opera <15 and Firefox >23
					/**
					 * For Firefox <23 and Opera <15, no need for JS to add to bookmarks
					 * The only thing needed is a `title` and a `rel="sidebar"`
					 * To ensure that the bookmarked URL doesn't have a complementary `#` from our trigger's href
					 * we force the current URL
					 */
					//triggerBookmark.attr('rel', 'sidebar').attr('title', document.title).attr('href', window.location.href);
					//return true;
				} else { // For the other browsers (mainly WebKit) we use a simple alert to inform users that they can add to bookmarks with ctrl+D/cmd+D
					this.notify('howToBookmark');
					//alert('You can add this page to your bookmarks by pressing ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D on your keyboard.');
				}
			},
			getDownloadLink(event) {
				return 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.data.output);
			},
			getUrlParameter(name) {
				name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
				var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
				var results = regex.exec(location.search);
				return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
			},
			writeText(str) {
				return new Promise(function(resolve, reject) {
					/********************************/
					var range = document.createRange();
					range.selectNodeContents(document.body);
					document.getSelection().addRange(range);
					/********************************/

					var success = false;
					function listener(e) {
						e.clipboardData.setData("text/plain", str);
						e.preventDefault();
						success = true;
					}
					document.addEventListener("copy", listener);
					document.execCommand("copy");
					document.removeEventListener("copy", listener);

					/********************************/
					document.getSelection().removeAllRanges();
					/********************************/

					success ? resolve(): reject();
				});
			}


		},


	});
});
