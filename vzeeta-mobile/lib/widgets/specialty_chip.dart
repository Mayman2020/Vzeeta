import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../models/specialty.dart';

class SpecialtyChip extends StatelessWidget {
  const SpecialtyChip({
    super.key,
    required this.specialty,
    this.selected = false,
    this.onTap,
  });

  final Specialty specialty;
  final bool selected;
  final VoidCallback? onTap;

  IconData _iconFor(String? icon) {
    switch (icon) {
      case 'favorite':
        return Icons.favorite;
      case 'face':
        return Icons.face;
      case 'dentistry':
        return Icons.medical_services_outlined;
      case 'child_care':
        return Icons.child_care;
      case 'accessibility':
        return Icons.accessibility;
      case 'hearing':
        return Icons.hearing;
      case 'pregnant_woman':
        return Icons.pregnant_woman;
      case 'visibility':
        return Icons.visibility;
      default:
        return Icons.medical_services;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: FilterChip(
        selected: selected,
        onSelected: onTap != null ? (_) => onTap!() : null,
        avatar: Icon(
          _iconFor(specialty.icon),
          size: 18,
          color: selected ? Colors.white : AppTheme.primaryBlue,
        ),
        label: Text(specialty.displayName),
        selectedColor: AppTheme.primaryBlue,
        checkmarkColor: Colors.white,
        labelStyle: TextStyle(
          color: selected ? Colors.white : AppTheme.textPrimary,
          fontSize: 13,
        ),
        backgroundColor: AppTheme.accentLight,
        side: BorderSide.none,
      ),
    );
  }
}

class SpecialtyGrid extends StatelessWidget {
  const SpecialtyGrid({
    super.key,
    required this.specialties,
    this.onTap,
  });

  final List<Specialty> specialties;
  final void Function(Specialty)? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: specialties.length,
        itemBuilder: (context, index) {
          final specialty = specialties[index];
          return GestureDetector(
            onTap: onTap != null ? () => onTap!(specialty) : null,
            child: Container(
              width: 80,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppTheme.accentLight,
                    child: Icon(
                      Icons.medical_services,
                      color: AppTheme.primaryBlue,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    specialty.displayName,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
