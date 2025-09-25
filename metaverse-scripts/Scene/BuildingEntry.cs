using UnityEngine;

public class BuildingEntry : MonoBehaviour
{
    public string interiorSceneName;
    public Vector3 entryPosition; // Position where player should appear in the new scene

    private bool isLoading = false;

    private void OnTriggerEnter(Collider other)
    {
        if (!isLoading && other.CompareTag("Player"))
        {
            isLoading = true;
            SceneFader.Instance.FadeAndLoadScene(interiorSceneName, entryPosition, () =>
            {
                isLoading = false;
            });
        }
    }
}
