import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/doctor.dart';

class DoctorCard extends StatelessWidget {
  const DoctorCard({
    super.key,
    required this.doctor,
    this.onTap,
    this.compact = false,
  });

  final Doctor doctor;
  final VoidCallback? onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: compact ? 0 : 16, vertical: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              CircleAvatar(
                radius: compact ? 28 : 32,
                backgroundColor: AppTheme.accentLight,
                backgroundImage:
                    doctor.profileImage != null ? NetworkImage(doctor.profileImage!) : null,
                child: doctor.profileImage == null
                    ? Icon(Icons.person, color: AppTheme.primaryBlue, size: compact ? 28 : 32)
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            doctor.displayName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (doctor.verified)
                          const Icon(Icons.verified, color: AppTheme.primaryBlue, size: 16),
                      ],
                    ),
                    if (doctor.displayTitle.isNotEmpty)
                      Text(
                        doctor.displayTitle,
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    if (doctor.specialtiesText.isNotEmpty)
                      Text(
                        doctor.specialtiesText,
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          doctor.ratingAvg.toStringAsFixed(1),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          ' (${doctor.ratingCount})',
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                        const Spacer(),
                        Text(
                          '${doctor.consultationFee.toStringAsFixed(0)} ج.م',
                          style: const TextStyle(
                            color: AppTheme.primaryBlue,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
