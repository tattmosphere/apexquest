-- Standardize muscle group naming to Title Case
UPDATE exercises SET primary_muscle_group = 'Back' WHERE LOWER(primary_muscle_group) = 'back';
UPDATE exercises SET primary_muscle_group = 'Chest' WHERE LOWER(primary_muscle_group) = 'chest';
UPDATE exercises SET primary_muscle_group = 'Shoulders' WHERE LOWER(primary_muscle_group) IN ('shoulders', 'shoulder');
UPDATE exercises SET primary_muscle_group = 'Biceps' WHERE LOWER(primary_muscle_group) = 'biceps';
UPDATE exercises SET primary_muscle_group = 'Triceps' WHERE LOWER(primary_muscle_group) = 'triceps';
UPDATE exercises SET primary_muscle_group = 'Quads' WHERE LOWER(primary_muscle_group) IN ('quads', 'upper legs');
UPDATE exercises SET primary_muscle_group = 'Hamstrings' WHERE LOWER(primary_muscle_group) = 'hamstrings';
UPDATE exercises SET primary_muscle_group = 'Calves' WHERE LOWER(primary_muscle_group) IN ('calves', 'lower legs');
UPDATE exercises SET primary_muscle_group = 'Glutes' WHERE LOWER(primary_muscle_group) = 'glutes';
UPDATE exercises SET primary_muscle_group = 'Abs' WHERE LOWER(primary_muscle_group) IN ('abs', 'core');
UPDATE exercises SET primary_muscle_group = 'Forearms' WHERE LOWER(primary_muscle_group) = 'forearms';
UPDATE exercises SET category = 'cardio' WHERE LOWER(category) = 'cardio';