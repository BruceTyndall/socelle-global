import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Service record screen — log a treatment/service for a client.
///
/// DEMO surface.
class ServiceRecordScreen extends StatefulWidget {
  const ServiceRecordScreen({super.key, required this.recordId});
  final String recordId;

  @override
  State<ServiceRecordScreen> createState() => _ServiceRecordScreenState();
}

class _ServiceRecordScreenState extends State<ServiceRecordScreen> {
  final _notesController = TextEditingController();
  String _selectedService = 'Chemical Peel';
  final _services = ['Chemical Peel', 'LED Therapy', 'Hydrafacial', 'Microneedling', 'Dermaplaning', 'Consultation'];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Service Record'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Service Type', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            DropdownButtonFormField<String>(
              value: _selectedService,
              decoration: const InputDecoration(),
              items: _services.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _selectedService = v!),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Date & Time', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            TextFormField(
              decoration: const InputDecoration(
                hintText: 'Select date...',
                suffixIcon: Icon(Icons.calendar_today_outlined, size: 18),
              ),
              readOnly: true,
              onTap: () async {
                await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime(2024),
                  lastDate: DateTime.now(),
                );
              },
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Products Used', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            TextFormField(
              decoration: const InputDecoration(hintText: 'e.g., Glycolic 30% peel, SPF 50...'),
              maxLines: 2,
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Treatment Notes', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(hintText: 'Document the treatment details...'),
              maxLines: 4,
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Before/After Photos', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            Row(
              children: [
                _PhotoUploadBox(label: 'Before'),
                const SizedBox(width: SocelleTheme.spacingMd),
                _PhotoUploadBox(label: 'After'),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingXl),

            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Service record saved (demo)')),
                  );
                  context.pop();
                },
                child: const Text('Save Record'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhotoUploadBox extends StatelessWidget {
  const _PhotoUploadBox({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: () {},
        child: Container(
          height: 120,
          decoration: BoxDecoration(
            color: SocelleTheme.warmIvory,
            borderRadius: SocelleTheme.borderRadiusMd,
            border: Border.all(color: SocelleTheme.borderLight, style: BorderStyle.solid),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.add_a_photo_outlined, color: SocelleTheme.textFaint, size: 28),
              const SizedBox(height: SocelleTheme.spacingXs),
              Text(label, style: SocelleTheme.labelSmall),
            ],
          ),
        ),
      ),
    );
  }
}
