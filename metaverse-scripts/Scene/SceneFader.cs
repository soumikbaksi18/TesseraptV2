using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Collections;

public class SceneFader : MonoBehaviour
{
    public static SceneFader Instance;
    public CanvasGroup fadeCanvasGroup;
    public float fadeDuration = 1f; // seconds

    private Vector3 nextPlayerPosition = Vector3.zero;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            SceneManager.sceneLoaded += OnSceneLoaded;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void FadeAndLoadScene(string sceneName, Vector3 playerPosition, System.Action onComplete = null)
    {
        nextPlayerPosition = playerPosition;
        StartCoroutine(FadeAndLoad(sceneName, onComplete));
    }

    private IEnumerator FadeAndLoad(string sceneName, System.Action onComplete)
    {
        yield return StartCoroutine(Fade(1)); // Fade out

        AsyncOperation async = SceneManager.LoadSceneAsync(sceneName);
        async.allowSceneActivation = true;

        while (!async.isDone)
        {
            yield return null;
        }

        yield return StartCoroutine(Fade(0)); // Fade in

        onComplete?.Invoke();
    }

    private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        // Find player in the loaded scene and move to nextPlayerPosition
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
        {
            player.transform.position = nextPlayerPosition;
        }
    }

    private IEnumerator Fade(float targetAlpha)
    {
        float startAlpha = fadeCanvasGroup.alpha;
        float time = 0f;
        while (!Mathf.Approximately(fadeCanvasGroup.alpha, targetAlpha))
        {
            time += Time.unscaledDeltaTime;
            fadeCanvasGroup.alpha = Mathf.Lerp(startAlpha, targetAlpha, time / fadeDuration);
            yield return null;
        }
        fadeCanvasGroup.alpha = targetAlpha;
    }
}
