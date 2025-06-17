#pragma once

#include "constants.h"
#include "inference_engine_generator.h"
#include "api_pose_matching.h"
#include "execution_provider.h"
#include "license_manager.h"
#include "logger.h"
#include "optimization_mode.h"

using namespace lightbuzz;

extern "C" {
    EXPORT bool lightbuzz_license_check(char* file, int& year, int& month, int& day);
	EXPORT void lightbuzz_body_tracking_init(unsigned char* model_data_landscape, unsigned char* model_data_portrait, unsigned char* model_data_convert, int model_data_length, int model_data_convert_length, int upscaling, int device_id);
	EXPORT float* lightbuzz_body_tracking_update(unsigned char* input, int source_width, int source_height, int source_channels, OptimizationMode optimization_mode, int& data_length, int& num_of_persons);
	EXPORT void lightbuzz_body_tracking_release();
	EXPORT const char* lightbuzz_body_tracking_copyright();
    EXPORT void lightbuzz_2d_to_3d_all(float* input, float* output);
}
