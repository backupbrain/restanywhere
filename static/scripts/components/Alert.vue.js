
export default {
	props: {
		type: {
			type: String,
			default: 'warning', // warning, success, danger
		},
		message: {
			type: String,
			required: true,
		}
	},
	i18n: {
		messages: {
			en: {
				close: 'Close',
			},
		}
	},
	name: 'Alert',
	data () {
		return {
			TIMEOUT_MS: 1500,
			isHidden: true,
		}
	},
	methods: {
		hide() {
			this.isHidden = true;
		},
		show() {
			this.isHidden = false;
			setTimeout(() => {
				this.hide();
			}, this.TIMEOUT_MS);
		},
		toggle() {
			if (this.isHidden == true) {
				this.show();
			} else {
				this.hide();
			}
		}
	},
	template: `
			<div
				class="alert"
				:class="[{ hidden: isHidden }, 'alert-' + type]"
				role="alert"
			>
				<div class="container">
					{{ message }}
					<button type="button"
						class="close"
						data-dismiss="alert"
						aria-label="$t('close'}"
						@click="hide()"
					>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
			</div>
	`
};
