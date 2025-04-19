# Changelog

## v1.1.0 (2025-04-16)

### Added
- API URL configuration in settings
- Simulated API mode toggle
- Support for Chromebook with external USB NFC readers
- WebUSB API implementation for NFC reader communication
- Manual card entry fallback when readers are unavailable
- Enhanced status indicators (green=online, red=offline, blue=syncing, orange=simulated)
- CHROMEBOOK_DEPLOYMENT.md with detailed setup instructions
- CHROMEBOOK_NFC_GUIDE.md with technical implementation details
- API_CONFIG_README.md explaining all new configuration options

### Improved
- Network detection for areas with erratic internet connectivity
- Offline transaction handling with better conflict resolution
- Documentation throughout the codebase
- Error handling and user feedback
- Synchronization reliability when connectivity is restored
- Visual feedback during network status changes
- Build scripts for more consistent packaging

### Fixed
- Issue with duplicate transactions during sync
- Card ID normalization for both manual entry and scanned cards
- Balance validation to prevent negative balances

## v1.0.0 (2025-04-06)

### Added
- Initial release with basic functionality
- NFC card scanning (Web NFC API for Android)
- Customer registration with balance
- Payment processing
- Transaction history
- Offline mode basics
- Balance reloading
- Multiple items per transaction
- Documentation for deployment